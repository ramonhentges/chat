import React, { useContext, useState, useEffect, useCallback } from "react";
import { Group } from "../../interfaces/group";
import { User } from "../../interfaces/user";
import { UserMessage } from "../../interfaces/user-message";
import {
  getLatestMessages,
  getUserMessages,
} from "../../services/message.service";
import { useAuth } from "../Auth";
import {
  socket,
  sendUserMessage,
  sendGroupMessage,
} from "../../services/socket.service";

enum MessageType {
  Sended,
  Received,
}

interface ConversationContextProps {
  destination: Group | User | null;
  setDestination: (destination: Group | User) => void;
  loading: boolean;
  messages: UserMessage[];
  sendMessage: (message: string) => void;
  lastMessages: UserMessage[];
}

const transformUserMessages = (messages: UserMessage[]): UserMessage[] => {
  const transformedMessages: UserMessage[] = [];
  messages.forEach((message: UserMessage) => {
    transformedMessages.push(transformUserMessage(message));
  });
  return transformedMessages;
};

const transformUserMessage = (message: UserMessage): UserMessage => {
  return {
    ...message,
    createdAt: new Date(message.createdAt),
  };
};

const ConversationContext = React.createContext<ConversationContextProps>(
  {} as ConversationContextProps
);

export const ConversationProvider: React.FC = ({ children }) => {
  const [destination, setDestinationState] = useState<Group | User | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<UserMessage[]>([]);
  const [lastMessages, setLastMessages] = useState<UserMessage[]>([]);

  const { signOut } = useAuth();

  useEffect(() => {
    async function getLastMessages() {
      const latestMessages = await getLatestMessages();
      if (latestMessages?.status === 200) {
        setLastMessages(transformUserMessages(latestMessages.data));
      }
    }
    getLastMessages();
  }, []);

  const receiveUserMessage = useCallback(
    (message: UserMessage, messageType: MessageType) => {
      if (message.origin.username === message.userDestination.username) {
        if (
          lastMessages.some(
            (lastMessage) =>
              lastMessage.origin.username === message.origin.username &&
              lastMessage.userDestination.username ===
                message.userDestination.username
          )
        ) {
          setLastMessages((prevState) =>
            prevState.map((lastMessage) => {
              if (
                destination &&
                "username" in destination &&
                lastMessage.origin.username === message.origin.username &&
                lastMessage.userDestination.username ===
                  message.userDestination.username
              ) {
                return message;
              }
              return lastMessage;
            })
          );
        } else {
          setLastMessages((prevState) => [message, ...prevState]);
        }
      } else if (
        messageType === MessageType.Received
          ? lastMessages.some((lastMessage) =>
              [
                lastMessage.origin.username,
                lastMessage.userDestination.username,
              ].includes(message.origin.username)
            )
          : lastMessages.some((lastMessage) =>
              [
                lastMessage.origin.username,
                lastMessage.userDestination.username,
              ].includes(message.userDestination.username)
            )
      ) {
        if (messageType === MessageType.Received) {
          setLastMessages((prevState) =>
            prevState.map((lastMessage) => {
              if (
                [
                  lastMessage.origin.username,
                  lastMessage.userDestination.username,
                ].includes(message.origin.username)
              ) {
                return message;
              }
              return lastMessage;
            })
          );
        } else if (messageType === MessageType.Sended) {
          setLastMessages((prevState) =>
            prevState.map((lastMessage) => {
              if (
                [
                  lastMessage.origin.username,
                  lastMessage.userDestination.username,
                ].includes(message.userDestination.username)
              ) {
                return message;
              }
              return lastMessage;
            })
          );
        }
      } else {
        setLastMessages((prevState) => [message, ...prevState]);
      }

      if (
        destination &&
        messageType === MessageType.Received &&
        "username" in destination &&
        destination.username === message.origin.username
      ) {
        setMessages((oldMsgs) => [...oldMsgs, message]);
      } else if (
        destination &&
        messageType === MessageType.Sended &&
        "username" in destination &&
        destination.username === message.userDestination.username
      ) {
        setMessages((oldMsgs) => [...oldMsgs, message]);
      }
    },
    [destination, lastMessages]
  );

  useEffect(() => {
    socket.off("sendedMsgFromUser");
    socket.on("sendedMsgFromUser", (message: UserMessage) => {
      receiveUserMessage(transformUserMessage(message), MessageType.Sended);
    });

    socket.off("msgFromUser");
    socket.on("msgFromUser", (message: UserMessage) => {
      receiveUserMessage(transformUserMessage(message), MessageType.Received);
    });
  }, [receiveUserMessage]);

  async function setDestination(destination: Group | User) {
    setDestinationState(destination);
    setLoading(true);
    await getMessages(destination);
    setLoading(false);
  }

  function sendMessage(message: string) {
    if (destination && "username" in destination) {
      sendUserMessage(destination.username, message);
    } else if (destination && "uuid" in destination) {
      sendGroupMessage(destination.uuid, message);
    }
  }

  async function getMessages(destination: Group | User) {
    if ("username" in destination) {
      await getMessagesFromUser(destination);
    }
  }

  async function getMessagesFromUser(destination: User) {
    const response = await getUserMessages(destination);
    if (response.status === 200) {
      setMessages(transformUserMessages(response.data));
    }
    if (response.status === 401) {
      signOut();
    }
  }

  return (
    <ConversationContext.Provider
      value={{
        destination,
        setDestination,
        loading,
        messages,
        sendMessage,
        lastMessages,
      }}
    >
      {children}
    </ConversationContext.Provider>
  );
};

export const useConversation = () => useContext(ConversationContext);
