import { Button, IconButton } from '@material-ui/core';
import { Cancel, Delete as DeleteIcon } from '@material-ui/icons';
import React from 'react';
import { useConversation } from '../../contexts/Conversation';
import { deleteUserMessage } from '../../services/socket.service';

export default function SelectedMessageInfo() {
  const { selectedMessage, setSelectedMessage } = useConversation();
  const deleteMessage = () => {
    selectedMessage && deleteUserMessage(selectedMessage.id);
    setSelectedMessage(undefined);
  };
  return selectedMessage ? (
    <>
      <Button
        variant="outlined"
        startIcon={<DeleteIcon />}
        onClick={deleteMessage}
      >
        Deletar
      </Button>
      <IconButton onClick={() => setSelectedMessage(undefined)}>
        <Cancel />
      </IconButton>
    </>
  ) : (
    <></>
  );
}
