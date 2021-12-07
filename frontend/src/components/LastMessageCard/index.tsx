import React from 'react';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Avatar from '@mui/material/Avatar';
import { useAuth } from '../../contexts/Auth';
import { useConversation } from '../../contexts/Conversation';
import { UserMessage } from '../../models/user-message';
import { Typography } from '@mui/material';

interface LastMessageCardProps {
  lastMessage: UserMessage;
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
    user?.username === lastMessage.origin.username
      ? lastMessage.userDestination
      : lastMessage.origin;

  function isSelected() {
    if (
      destination &&
      'username' in destination &&
      destination.username === contact.username
    ) {
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
        avatar={<Avatar aria-label="recipe">{contact.fullName[0]}</Avatar>}
        title={contact.getConversationTitle()}
        subheader={
          user?.username === lastMessage.origin.username
            ? `Você: ${lastMessage.getMessage()}`
            : `${lastMessage.getMessage()}`
        }
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
