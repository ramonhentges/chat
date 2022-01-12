import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import React from 'react';
import { useAuth } from '../../contexts/Auth';
import { useConversation } from '../../contexts/Conversation';
import { IMessage } from '../../interfaces/i-message';
import { Group } from '../../models/group';
import { ReadedInfo } from '../ReadedInfo';

interface LastMessageCardProps {
  lastMessage: IMessage;
}

const LastMessageCard: React.FC<LastMessageCardProps> = ({ lastMessage }) => {
  const { user } = useAuth();
  const { destination, setDestination } = useConversation();
  const contact =
    lastMessage.destination() instanceof Group
      ? lastMessage.destination()
      : user?.username === lastMessage.origin.username
      ? lastMessage.destination()
      : lastMessage.origin;

  function isSelected() {
    if (destination && destination.getKey() === contact.getKey()) {
      return true;
    }
    return false;
  }

  return (
    <Card
      sx={
        isSelected()
          ? {
              width: 300,
              mb: 0.3,
              backgroundColor: 'secondary.main',
              cursor: 'pointer'
            }
          : { width: 300, mb: 0.3, cursor: 'pointer' }
      }
      square={true}
      variant="outlined"
      onClick={() => setDestination(contact)}
    >
      <CardHeader
        avatar={<Avatar aria-label="recipe">{contact.getTitle()[0]}</Avatar>}
        title={contact.getConversationTitle()}
        subheader={user && lastMessage.getCardMessage(user)}
      />
      <ReadedInfo
        message={lastMessage}
        type="card"
        sx={{ marginTop: -3, paddingRight: 1 }}
      />
    </Card>
  );
};

export default LastMessageCard;
