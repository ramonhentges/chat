import { SpeedDial, SpeedDialAction } from '@mui/material';
import { Person, Group } from '@mui/icons-material';
import SpeedDialIcon from '@mui/material/SpeedDialIcon';
import { useRef } from 'react';
import FindUserModal from '../FindUserModal';
import { useConversation } from '../../contexts/Conversation';
import { User } from '../../models/user';

const NewConversationButton: React.FC = () => {
  const { setDestination } = useConversation();
  const findUser = useRef<any>(null);
  const openFindUserModal = () => {
    findUser.current.handleOpenFindUserModal();
  };
  const selectUser = (user: User) => {
    setDestination(user);
    findUser.current.handleClose();
  };
  const actions = [
    { icon: <Person />, name: 'Usuário', action: openFindUserModal },
    {
      icon: <Group />,
      name: 'Grupo',
      action: () => console.log('other function')
    }
  ];
  return (
    <>
      <SpeedDial
        sx={{ position: 'absolute', bottom: 10, right: 10 }}
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
    </>
  );
};

export default NewConversationButton;
