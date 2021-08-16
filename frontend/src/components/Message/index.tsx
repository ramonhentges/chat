import { Chip, Grid, Typography } from "@material-ui/core";
import React from "react";
import { useAuth } from "../../contexts/Auth";
import { UserMessage } from "../../interfaces/user-message";
import useStyles from "./styles";

interface MessageProps {
  message: UserMessage;
}

export default function Message(props: MessageProps) {
  const classes = useStyles();
  const { message } = props;
  const { user } = useAuth();
  const myMessage = user?.username === message.origin.username ? true : false;

  return (
    <Grid
      item
      className={classes.messageGrid}
      style={
        myMessage ? { alignSelf: "flex-end" } : { alignSelf: "flex-start" }
      }
    >
      <Chip
        variant={myMessage ? "outlined" : "default"}
        label={
          <Typography variant="body2" style={{ whiteSpace: "normal" }}>
            {message.message}
          </Typography>
        }
        className={classes.message}
      />
    </Grid>
  );
}
