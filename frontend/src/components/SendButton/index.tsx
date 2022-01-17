import {
  Grid,
  FormControl,
  InputLabel,
  OutlinedInput,
  IconButton
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import React, { useState } from 'react';
import { useConversation } from '../../contexts/Conversation';
import { SelectEmoji } from '../SelectEmoji';

export default function SendButton() {
  const [message, setMessage] = useState('');
  const { destination, loading, sendMessage } = useConversation();

  function sendMessageClick(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    sendMessage(message);
    setMessage('');
  }
  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    let value = event.target.value;
    setMessage(value);
  }

  function addEmoji(emoji: string) {
    setMessage((prev) => `${prev} ${emoji}`.trim());
  }

  return !!destination && !loading ? (
    <Grid item sx={{ p: 2 }}>
      <form onSubmit={sendMessageClick}>
        <FormControl
          fullWidth
          size="small"
          variant="outlined"
          onChange={handleInputChange}
        >
          <OutlinedInput
            label="Mensagem"
            autoComplete="off"
            id="outlined-adornment-amount"
            value={message}
            endAdornment={
              <>
                <SelectEmoji addEmoji={addEmoji} />
                <IconButton size="small" aria-label="search" type="submit">
                  <SendIcon />
                </IconButton>
              </>
            }
          />
          <InputLabel variant="outlined" htmlFor="outlined-adornment-amount">
            Mensagem
          </InputLabel>
        </FormControl>
      </form>
    </Grid>
  ) : (
    <></>
  );
}
