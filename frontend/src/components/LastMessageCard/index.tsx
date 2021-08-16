import React from "react";
import Card from "@material-ui/core/Card";
import CardHeader from "@material-ui/core/CardHeader";
import Avatar from "@material-ui/core/Avatar";
import useStyles from "./styles";
import { useAuth } from "../../contexts/Auth";
import { useConversation } from "../../contexts/Conversation";
import { UserMessage } from "../../interfaces/user-message";

interface LastMessageCardProps {
  lastMessage: UserMessage;
}

const LastMessageCard: React.FC<LastMessageCardProps> = ({ lastMessage }) => {
  const classes = useStyles();
  const { user } = useAuth();
  const { destination, setDestination } = useConversation();
  const contact =
    user?.username === lastMessage.origin.username
      ? lastMessage.userDestination
      : lastMessage.origin;

  function isSelected() {
    if (
      destination &&
      "username" in destination &&
      destination.username === contact.username
    ) {
      return true;
    }
    return false;
  }

  return (
    <Card
      className={isSelected() ? classes.selected : classes.notSelected}
      square={true}
      variant="outlined"
      onClick={() => setDestination(contact)}
    >
      <CardHeader
        avatar={<Avatar aria-label="recipe">R</Avatar>}
        title={`${contact.fullName} - ${contact.username}`}
        subheader={
          user?.username === lastMessage.origin.username
            ? `Você: ${lastMessage.message}`
            : `${lastMessage.message}`
        }
      />
    </Card>
  );
};

export default LastMessageCard;
