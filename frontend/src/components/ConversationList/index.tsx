import { useConversation } from "../../contexts/Conversation";
import { UserMessage } from "../../interfaces/user-message";
import LastMessageCard from "../LastMessageCard";

export default function ConversationList() {
  const { lastMessages } = useConversation();

  return (
    <>
      {lastMessages.map((contactMessage: UserMessage) => (
        <LastMessageCard
          key={contactMessage.uuid}
          lastMessage={contactMessage}
        />
      ))}
    </>
  );
}
