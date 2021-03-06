import { Delete, Info } from '@mui/icons-material';
import {
  CircularProgress,
  Grid,
  ListItemIcon,
  Menu,
  MenuItem,
  Typography
} from '@mui/material';
import Fade from '@mui/material/Fade';
import { useInjection } from 'inversify-react';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  MINUTES_TO_DELETE_MESSAGE,
  SCROLL_POSITION_TO_TAKE_MORE_MESSAGES,
  SCROll_TO_BOTTOM_OFFSET
} from '../../constants/message';
import { useAlert } from '../../contexts/AlertSnackbar';
import { useConfirm } from '../../contexts/ConfirmDialog';
import { useConversation } from '../../contexts/Conversation';
import { GroupMessage } from '../../models/group-message';
import { UserMessage } from '../../models/user-message';
import { SocketService } from '../../ports/services/SocketService';
import { TYPES } from '../../types/InversifyTypes';
import { sameDay } from '../../util/date';
import Message from '../Message';
import { DateChip } from './DateChip';
import ShowMessageInfoModal from '../ShowMessageInfo';

function canTakeMoreMessages(
  scrollTop: number,
  initialLoad: boolean,
  alreadyGettingMoreMessages: boolean
) {
  return (
    scrollTop <= SCROLL_POSITION_TO_TAKE_MORE_MESSAGES &&
    !initialLoad &&
    !alreadyGettingMoreMessages
  );
}

function canScrollDown(scrollPosition: number, scrollHeight: number) {
  return scrollPosition >= scrollHeight - SCROll_TO_BOTTOM_OFFSET;
}

export default function MessagesList() {
  const _socketService = useInjection<SocketService>(TYPES.SocketService);
  const messagesGrid = useRef<HTMLDivElement>(null);
  const messageInfoRef = useRef<any>();
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
  const autoScrollDown = useRef(true);
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
        title: 'Aviso de exclus??o',
        message: 'Desaja mesmo excluir a mensagem?'
      }).then(() => {
        if (selectedMessage instanceof UserMessage) {
          _socketService.deleteUserMessage(selectedMessage.id);
        } else if (selectedMessage instanceof GroupMessage) {
          _socketService.deleteGroupMessage(selectedMessage.id);
        }
        setSelectedMessage(undefined);
        setAnchorEl(null);
      });
    } else {
      setSelectedMessage(undefined);
      setAnchorEl(null);
      openAlert({
        severity: 'info',
        message: `Voc?? n??o pode remover mensagens com mais de ${MINUTES_TO_DELETE_MESSAGE} minutos`
      });
    }
  };

  useLayoutEffect(() => {
    !loading && autoScrollDown.current && scrollToBottom();
  }, [messages, loading]);

  useEffect(() => {
    autoScrollDown.current = true;
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
            canTakeMoreMessages(
              scrollTop,
              initialLoad.current,
              gettingMoreMessages.current
            )
          ) {
            gettingMoreMessages.current = true;
            await getMoreMessages();
            gettingMoreMessages.current = false;
          }
          if (canScrollDown(scrollPosition, scrollHeight)) {
            initialLoad.current = false;
            autoScrollDown.current = true;
          } else {
            autoScrollDown.current = false;
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
    <>
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
              <DateChip date={message.createdAt} />
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
          <MenuItem
            onClick={() => messageInfoRef.current!.handleOpen(selectedMessage)}
          >
            <ListItemIcon>
              <Info fontSize="small" />
            </ListItemIcon>
            <Typography variant="inherit">Informa????es</Typography>
          </MenuItem>
          <MenuItem onClick={deleteMessage}>
            <ListItemIcon>
              <Delete fontSize="small" />
            </ListItemIcon>
            <Typography variant="inherit">Deletar Mensagem</Typography>
          </MenuItem>
        </Menu>
      </Grid>
      <ShowMessageInfoModal ref={messageInfoRef} />
    </>
  );
}
