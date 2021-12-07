import { Chip, Grid, Typography } from '@material-ui/core';
import React from 'react';
import { useAuth } from '../../contexts/Auth';
import { useConversation } from '../../contexts/Conversation';
import { UserMessage } from '../../models/user-message';
import useStyles from './styles';

interface MessageProps {
  message: UserMessage;
  openMenu: (event: React.MouseEvent<HTMLElement>) => void;
}

const getMessageTime = (date: Date): string => {
  return `${date.getHours()}:${
    date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes()
  }`;
};

export default function Message({ message, openMenu }: MessageProps) {
  const classes = useStyles();
  const { user } = useAuth();
  const { setSelectedMessage, selectedMessage } = useConversation();
  const myMessage = user?.username === message.origin.username ? true : false;

  return (
    <Grid
      item
      className={classes.messageGrid}
      style={
        myMessage ? { alignSelf: 'flex-end' } : { alignSelf: 'flex-start' }
      }
    >
      <Chip
        variant={myMessage ? 'outlined' : 'default'}
        color={selectedMessage === message ? 'secondary' : undefined}
        onClick={
          myMessage && !message.deleted
            ? (event) => {
                openMenu(event);
                setSelectedMessage(message);
              }
            : undefined
        }
        label={
          <>
            <Typography variant="body2" style={{ whiteSpace: 'normal' }}>
              {message.getMessage()}
            </Typography>
            <Typography align="right" display="block" variant="caption">
              {getMessageTime(message.createdAt)}
            </Typography>
          </>
        }
        className={classes.message}
      />
    </Grid>
  );
}
