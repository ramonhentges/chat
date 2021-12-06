import { useConversation } from '../../contexts/Conversation';
import { UserMessage } from '../../models/user-message';
import LastMessageCard from '../LastMessageCard';

export default function ConversationList() {
  const { lastMessages } = useConversation();

  return (
    <>
      {lastMessages.map((contactMessage: UserMessage) => (
        <LastMessageCard key={contactMessage.id} lastMessage={contactMessage} />
      ))}
    </>
  );
}
