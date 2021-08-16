import React from "react";
import Card from "@material-ui/core/Card";
import CardHeader from "@material-ui/core/CardHeader";
import Avatar from "@material-ui/core/Avatar";
import useStyles from "./styles";
import { useConversation } from "../../contexts/Conversation";

export default function ConversationCard() {
  const classes = useStyles();
  const { destination } = useConversation();
  const title =
    destination !== null && "username" in destination
      ? destination.fullName
      : destination?.name;

  const subheader =
    destination !== null && "username" in destination
      ? destination.username
      : destination?.description;

  return !!destination ? (
    <Card className={classes.root} square={true}>
      <CardHeader
        avatar={
          <Avatar aria-label="recipe" className={classes.avatar}>
            R
          </Avatar>
        }
        title={title}
        subheader={subheader}
        titleTypographyProps={{ color: "secondary" }}
      />
    </Card>
  ) : (
    <></>
  );
}
