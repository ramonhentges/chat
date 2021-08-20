import { Chip, CircularProgress, Grid, Typography } from "@material-ui/core";
import React, { useEffect, useRef } from "react";
import { useConversation } from "../../contexts/Conversation";
import Message from "../Message";
import useStyles from "./styles";

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
  const { messages, loading } = useConversation();

  useEffect(() => {
    !loading && scrollToBottom();
  }, [messages, loading]);

  const scrollToBottom = () => {
    messagesGrid.current!.scroll({
      top: messagesGrid.current!.scrollHeight,
      behavior: "smooth",
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
          {(idx === 0 || (idx > 0 && !sameDay(message.createdAt, messages[idx - 1].createdAt))) && (
            <Chip
              className={classes.date}
              variant="outlined"
              label={
                  <Typography variant="body2" style={{ whiteSpace: "normal" }}>
                    {message.createdAt.toLocaleDateString()}
                  </Typography>
              }
            />
          )}
          <Message key={message.uuid} message={message} />
        </>
      ))}
    </Grid>
  );
}
