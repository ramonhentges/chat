import {
  Grid,
  FormControl,
  InputLabel,
  OutlinedInput,
  IconButton
} from '@material-ui/core';
import SendIcon from '@material-ui/icons/Send';
import React, { useState } from 'react';
import { useConversation } from '../../contexts/Conversation';
import useStyles from './styles';

export default function SendButton() {
  const [message, setMessage] = useState('');
  const classes = useStyles();
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

  return !!destination && !loading ? (
    <Grid item className={classes.sendGrid}>
      <form onSubmit={sendMessageClick}>
        <FormControl
          fullWidth
          size="small"
          variant="outlined"
          onChange={handleInputChange}
        >
          <InputLabel htmlFor="outlined-adornment-amount">Mensagem</InputLabel>
          <OutlinedInput
            autoComplete="off"
            labelWidth={80}
            id="outlined-adornment-amount"
            value={message}
            endAdornment={
              <IconButton size="small" aria-label="search" type="submit">
                <SendIcon />
              </IconButton>
            }
          />
        </FormControl>
      </form>
    </Grid>
  ) : (
    <></>
  );
}
