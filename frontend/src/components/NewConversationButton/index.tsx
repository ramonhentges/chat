import { Fab } from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import { useRef } from "react";
import FindUserModal from "../FindUserModal";
import useStyles from "./styles";

const NewConversationButton: React.FC = () => {
  const classes = useStyles();
  const findUser = useRef<any>(null);
  const openFindUserModal = () => {
    findUser.current.handleOpenFindUserModal();
  };
  return (
    <>
      <Fab
        className={classes.fab}
        color="primary"
        aria-label="add"
        onClick={openFindUserModal}
      >
        <AddIcon />
      </Fab>
      <FindUserModal ref={findUser} />
    </>
  );
};

export default NewConversationButton;
