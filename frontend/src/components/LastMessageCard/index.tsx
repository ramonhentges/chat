import { Typography } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import React from 'react';
import { useAuth } from '../../contexts/Auth';
import { useConversation } from '../../contexts/Conversation';
import { IMessage } from '../../interfaces/i-message';
import { Group } from '../../models/group';

interface LastMessageCardProps {
  lastMessage: IMessage;
}

const getTime = (date: Date): string => {
  const today = new Date();
  if (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  ) {
    return `${date.getHours()}:${
      date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes()
    }`;
  }
  return `${date.toLocaleString()}`;
};

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
      <Typography
        sx={{ marginTop: -3, paddingRight: 1 }}
        align="right"
        display="block"
        variant="caption"
      >
        {getTime(lastMessage.createdAt)}
      </Typography>
    </Card>
  );
};

export default LastMessageCard;
