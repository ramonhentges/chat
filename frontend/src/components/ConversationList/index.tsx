import { useConversation } from '../../contexts/Conversation';
import { IMessage } from '../../interfaces/i-message';
import LastMessageCard from '../LastMessageCard';

export default function ConversationList() {
  const { lastMessages } = useConversation();

  return (
    <>
      {lastMessages.map((contactMessage: IMessage) => (
        <LastMessageCard key={contactMessage.id} lastMessage={contactMessage} />
      ))}
    </>
  );
}
