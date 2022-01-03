import { SpeedDial, SpeedDialAction } from '@mui/material';
import { Person, Group } from '@mui/icons-material';
import SpeedDialIcon from '@mui/material/SpeedDialIcon';
import { useRef } from 'react';
import FindUserModal from '../FindUserModal';
import { useConversation } from '../../contexts/Conversation';
import { User } from '../../models/user';
import CreateGroupModal from '../CreateGroupModal';

const NewConversationButton: React.FC = () => {
  const { setDestination } = useConversation();
  const findUser = useRef<any>(null);
  const createGroup = useRef<any>(null);
  const openFindUserModal = () => {
    findUser.current.handleOpenFindUserModal(false);
  };

  const openCreateGroupModal = () => {
    createGroup.current.handleOpen();
  };

  const selectUser = (user: User | User[]) => {
    if (Array.isArray(user)) {
      setDestination(user[0]);
      findUser.current.handleClose();
    } else {
      setDestination(user);
      findUser.current.handleClose();
    }
  };

  const actions = [
    { icon: <Person />, name: 'Usuário', action: openFindUserModal },
    {
      icon: <Group />,
      name: 'Grupo',
      action: openCreateGroupModal
    }
  ];
  return (
    <>
      <SpeedDial
        sx={{ position: 'sticky', bottom: 10, transform: 'translateX(37%)' }}
        color="primary"
        ariaLabel="add conversation"
        icon={<SpeedDialIcon />}
      >
        {actions.map((action) => (
          <SpeedDialAction
            key={action.name}
            icon={action.icon}
            tooltipTitle={action.name}
            onClick={action.action}
          />
        ))}
      </SpeedDial>
      <FindUserModal ref={findUser} selectUserAction={selectUser} />
      <CreateGroupModal ref={createGroup} />
    </>
  );
};

export default NewConversationButton;
