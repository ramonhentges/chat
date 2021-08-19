import React, { useContext, useState, useEffect } from "react";
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

interface ConversationContextProps {
  destination: Group | User | null;
  setDestination: (destination: Group | User) => void;
  loading: boolean;
  messages: UserMessage[];
  sendMessage: (message: string) => void;
  lastMessages: UserMessage[];
}

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
        setLastMessages(latestMessages.data);
      }
    }
    getLastMessages();
  }, []);

  useEffect(() => {
    socket.off("sendedMsgFromUser");
    socket.on("sendedMsgFromUser", (message: UserMessage) => {
      if (
        lastMessages.some((lastMessage) =>
          [
            lastMessage.origin.username,
            lastMessage.userDestination.username,
          ].includes(message.origin.username)
        )
      ) {
        setLastMessages((prevState) =>
          prevState.map((lastMessage) => {
            if (
              destination &&
              "username" in destination &&
              [
                lastMessage.origin.username,
                lastMessage.userDestination.username,
              ].includes(destination.username)
            ) {
              return message;
            }
            return lastMessage;
          })
        );
      } else {
        setLastMessages((prevState) => [message, ...prevState]);
      }
      setMessages((oldMsgs) => [...oldMsgs, message]);
    });

    socket.off("msgFromUser");
    socket.on("msgFromUser", (message: UserMessage) => {
      if (
        destination &&
        "username" in destination &&
        destination.username === message.origin.username
      ) {
        setMessages((oldMsgs) => [...oldMsgs, message]);
      }
      if (
        lastMessages.some((lastMessage) =>
          [
            lastMessage.origin.username,
            lastMessage.userDestination.username,
          ].includes(message.origin.username)
        )
      ) {
        setLastMessages((prevState) =>
          prevState.map((lastMessage) => {
            if (
              destination &&
              "username" in destination &&
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
      } else {
        setLastMessages((prevState) => [message, ...prevState]);
      }
    });
  }, [destination, lastMessages]);

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
      setMessages(response.data);
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
