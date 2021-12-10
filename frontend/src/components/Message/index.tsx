import { Chip, Grid, Typography } from '@mui/material';
import React from 'react';
import { useAuth } from '../../contexts/Auth';
import { useConversation } from '../../contexts/Conversation';
import { GroupMessage } from '../../models/group-message';
import { UserMessage } from '../../models/user-message';
import { getUserColor } from '../../stores/user-color.store';
import { formatTime } from '../../util/date';

interface MessageProps {
  message: UserMessage | GroupMessage;
  openMenu: (event: React.MouseEvent<HTMLElement>) => void;
}

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
            {message instanceof GroupMessage && !myMessage && (
              <Typography
                variant="body2"
                sx={{ color: getUserColor(message.origin.getKey()) }}
              >
                {message.origin.getTitle()}
              </Typography>
            )}
            <Typography variant="body2" sx={{ whiteSpace: 'normal' }}>
              {message.getMessage()}
            </Typography>
            <Typography align="right" display="block" variant="caption">
              {formatTime(message.createdAt)}
            </Typography>
          </>
        }
        sx={{ padding: 1, height: '100%' }}
      />
    </Grid>
  );
}
