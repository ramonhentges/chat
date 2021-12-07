import { Chip, Grid, Typography } from '@mui/material';
import React from 'react';
import { useAuth } from '../../contexts/Auth';
import { useConversation } from '../../contexts/Conversation';
import { UserMessage } from '../../models/user-message';

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
  const { user } = useAuth();
  const { setSelectedMessage, selectedMessage } = useConversation();
  const myMessage = user?.username === message.origin.username ? true : false;

  return (
    <Grid
      item
      sx={{ maxWidth: '65%', mb: 1 }}
      style={
        myMessage ? { alignSelf: 'flex-end' } : { alignSelf: 'flex-start' }
      }
    >
      <Chip
        variant={myMessage ? 'outlined' : 'filled'}
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
        sx={{ padding: 1, height: '100%' }}
      />
    </Grid>
  );
}
