import { useConversation } from '../../contexts/Conversation';
import { GroupMessage } from '../../models/group-message';
import { UserMessage } from '../../models/user-message';
import LastMessageCard from '../LastMessageCard';

export default function ConversationList() {
  const { lastMessages } = useConversation();

  return (
    <>
      {lastMessages.map((contactMessage: UserMessage | GroupMessage) => (
        <LastMessageCard key={contactMessage.id} lastMessage={contactMessage} />
      ))}
    </>
  );
}
