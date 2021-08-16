import { CircularProgress, Grid } from "@material-ui/core";
import React, { useEffect, useRef } from "react";
import { useConversation } from "../../contexts/Conversation";
import Message from "../Message";
import useStyles from "./styles";

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
    <Grid container justify="center" alignItems="center" className={classes.messagesGrid}>
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
      {messages.map((message) => (
        <Message key={message.uuid} message={message} />
      ))}
    </Grid>
  );
}
