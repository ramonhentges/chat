import {
  Chip,
  CircularProgress,
  Grid,
  ListItemIcon,
  Menu,
  MenuItem,
  Typography
} from '@material-ui/core';
import React, { useEffect, useRef, useState } from 'react';
import { useConversation } from '../../contexts/Conversation';
import { deleteUserMessage } from '../../services/socket.service';
import Message from '../Message';
import useStyles from './styles';
import Fade from '@material-ui/core/Fade';
import { Delete } from '@material-ui/icons';

const sameDay = (firstDate: Date, secondDate: Date): boolean => {
  return (
    firstDate.getDate() === secondDate.getDate() &&
    firstDate.getMonth() === secondDate.getMonth() &&
    firstDate.getFullYear() === secondDate.getFullYear()
  );
};

export default function MessagesList() {
  const classes = useStyles();
  const messagesGrid = useRef<HTMLDivElement>(null);
  const { messages, loading, selectedMessage, setSelectedMessage } =
    useConversation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setSelectedMessage(undefined);
    setAnchorEl(null);
  };

  const deleteMessage = () => {
    selectedMessage && deleteUserMessage(selectedMessage.id);
    setAnchorEl(null);
  };

  useEffect(() => {
    !loading && scrollToBottom();
  }, [messages, loading]);

  const scrollToBottom = () => {
    messagesGrid.current!.scroll({
      top: messagesGrid.current!.scrollHeight,
      behavior: 'smooth'
    });
  };
  return loading ? (
    <Grid
      container
      justify="center"
      alignItems="center"
      className={classes.messagesGrid}
    >
      <CircularProgress />
    </Grid>
  ) : (
    <Grid
      container
      item
      alignItems="flex-start"
      direction="column"
      className={classes.messagesGrid}
      ref={messagesGrid}
    >
      {messages.map((message, idx) => (
        <>
          {(idx === 0 ||
            (idx > 0 &&
              !sameDay(message.createdAt, messages[idx - 1].createdAt))) && (
            <Chip
              className={classes.date}
              variant="outlined"
              label={
                <Typography variant="body2" style={{ whiteSpace: 'normal' }}>
                  {message.createdAt.toLocaleDateString()}
                </Typography>
              }
            />
          )}
          <Message key={message.id} message={message} openMenu={handleOpen} />
        </>
      ))}
      <Menu
        id="fade-menu"
        anchorEl={anchorEl}
        keepMounted
        open={open}
        onClose={handleClose}
        TransitionComponent={Fade}
        getContentAnchorEl={null}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={deleteMessage}>
          <ListItemIcon>
            <Delete fontSize="small" />
          </ListItemIcon>
          <Typography variant="inherit">Deletar Mensagem</Typography>
        </MenuItem>
      </Menu>
    </Grid>
  );
}
