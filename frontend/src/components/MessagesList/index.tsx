import {
  Chip,
  CircularProgress,
  Grid,
  ListItemIcon,
  Menu,
  MenuItem,
  Typography
} from '@mui/material';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useConversation } from '../../contexts/Conversation';
import {
  deleteGroupMessage,
  deleteUserMessage
} from '../../services/socket.service';
import Message from '../Message';
import Fade from '@mui/material/Fade';
import { Delete } from '@mui/icons-material';
import { useConfirm } from '../../contexts/ConfirmDialog';
import { UserMessage } from '../../models/user-message';
import { GroupMessage } from '../../models/group-message';
import { useAlert } from '../../contexts/AlertSnackbar';
import {
  MINUTES_TO_DELETE_MESSAGE,
  SCROLL_POSITION_TO_TAKE_MORE_MESSAGES
} from '../../constants/message';

const sameDay = (firstDate: Date, secondDate: Date): boolean => {
  return (
    firstDate.getDate() === secondDate.getDate() &&
    firstDate.getMonth() === secondDate.getMonth() &&
    firstDate.getFullYear() === secondDate.getFullYear()
  );
};

export default function MessagesList() {
  const messagesGrid = useRef<HTMLDivElement>(null);
  const { confirm } = useConfirm();
  const {
    messages,
    loading,
    selectedMessage,
    destination,
    setSelectedMessage,
    getMoreMessages
  } = useConversation();
  const { openAlert } = useAlert();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const scrollDown = useRef(true);
  const initialLoad = useRef(true);
  const gettingMoreMessages = useRef(false);
  const open = Boolean(anchorEl);

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setSelectedMessage(undefined);
    setAnchorEl(null);
  };

  const deleteMessage = () => {
    if (selectedMessage?.canDelete()) {
      confirm({
        title: 'Aviso de exclusão',
        message: 'Desaja mesmo excluir a mensagem?'
      }).then(() => {
        if (selectedMessage instanceof UserMessage) {
          deleteUserMessage(selectedMessage.id);
        } else if (selectedMessage instanceof GroupMessage) {
          deleteGroupMessage(selectedMessage.id);
        }
        setSelectedMessage(undefined);
        setAnchorEl(null);
      });
    } else {
      setSelectedMessage(undefined);
      setAnchorEl(null);
      openAlert({
        severity: 'info',
        message: `Você não pode remover mensagens com mais de ${MINUTES_TO_DELETE_MESSAGE} minutos`
      });
    }
  };

  useLayoutEffect(() => {
    !loading && scrollDown.current && scrollToBottom();
  }, [messages, loading]);

  useEffect(() => {
    scrollDown.current = true;
    initialLoad.current = true;
  }, [destination]);

  useLayoutEffect(() => {
    if (messagesGrid.current !== null) {
      messagesGrid.current.onscroll = async () => {
        if (messagesGrid.current !== null) {
          const { scrollTop, offsetHeight, scrollHeight } =
            messagesGrid.current;
          const scrollPosition = scrollTop + offsetHeight;
          if (
            scrollTop <= SCROLL_POSITION_TO_TAKE_MORE_MESSAGES &&
            !initialLoad.current &&
            !gettingMoreMessages.current
          ) {
            gettingMoreMessages.current = true;
            scrollDown.current = false;
            await getMoreMessages();
            gettingMoreMessages.current = false;
          } else if (scrollPosition === scrollHeight) {
            initialLoad.current = false;
            scrollDown.current = true;
          } else {
            scrollDown.current = false;
          }
        }
      };
    }
  }, [getMoreMessages]);

  const scrollToBottom = () => {
    messagesGrid.current!.scroll({
      top: messagesGrid.current!.scrollHeight,
      behavior: 'smooth'
    });
  };
  return loading ? (
    <Grid
      container
      justifyContent="center"
      alignItems="center"
      sx={{ flexGrow: 2, overflowY: 'auto', flexWrap: 'nowrap', padding: 2 }}
    >
      <CircularProgress />
    </Grid>
  ) : (
    <Grid
      container
      item
      alignItems="flex-start"
      direction="column"
      sx={{ flexGrow: 2, overflowY: 'auto', flexWrap: 'nowrap', padding: 2 }}
      ref={messagesGrid}
    >
      {messages.map((message, idx) => (
        <React.Fragment key={message.id}>
          {(idx === 0 ||
            (idx > 0 &&
              !sameDay(message.createdAt, messages[idx - 1].createdAt))) && (
            <Chip
              sx={{ alignSelf: 'center', mb: 2 }}
              variant="outlined"
              label={
                <Typography variant="body2" style={{ whiteSpace: 'normal' }}>
                  {message.createdAt.toLocaleDateString()}
                </Typography>
              }
            />
          )}
          <Message message={message} openMenu={handleOpen} />
        </React.Fragment>
      ))}
      <Menu
        id="fade-menu"
        anchorEl={anchorEl}
        keepMounted
        open={open}
        onClose={handleClose}
        TransitionComponent={Fade}
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
