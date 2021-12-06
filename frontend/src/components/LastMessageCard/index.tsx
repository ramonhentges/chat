import React from 'react';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import Avatar from '@material-ui/core/Avatar';
import useStyles from './styles';
import { useAuth } from '../../contexts/Auth';
import { useConversation } from '../../contexts/Conversation';
import { UserMessage } from '../../models/user-message';
import { Typography } from '@material-ui/core';

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
  const classes = useStyles();
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
      className={isSelected() ? classes.selected : classes.notSelected}
      square={true}
      variant="outlined"
      onClick={() => setDestination(contact)}
    >
      <CardHeader
        avatar={<Avatar aria-label="recipe">{contact.fullName[0]}</Avatar>}
        title={`${contact.fullName} - ${contact.username}`}
        subheader={
          user?.username === lastMessage.origin.username
            ? `Você: ${lastMessage.getMessage()}`
            : `${lastMessage.getMessage()}`
        }
      />
      <Typography
        className={classes.showTime}
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
