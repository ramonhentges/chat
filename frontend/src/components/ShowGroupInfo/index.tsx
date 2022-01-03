import { Button, Divider, List, Stack, Typography } from '@mui/material';
import { useInjection } from 'inversify-react';
import React, { useEffect, useRef, useState } from 'react';
import { useAlert } from '../../contexts/AlertSnackbar';
import { useConfirm } from '../../contexts/ConfirmDialog';
import { useConversation } from '../../contexts/Conversation';
import { HttpStatus } from '../../enum/http-status.enum';
import { Group } from '../../models/group';
import { User } from '../../models/user';
import { PlainClassConverter } from '../../ports/PlainClassConverter';
import { GroupService } from '../../ports/services/GroupService';
import { TYPES } from '../../types/InversifyTypes';
import FindUserModal from '../FindUserModal';
import GroupUserCard from './GroupUserCard';

const ShowGroupInfo = () => {
  const { destination } = useConversation();
  const { openAlert } = useAlert();
  const { confirm } = useConfirm();
  const [group, setGroup] = useState<Group>(new Group());
  const addUsersRef = useRef<any>(null);
  const _groupService = useInjection<GroupService>(TYPES.GroupService);
  const _plainClassConverter = useInjection<PlainClassConverter>(
    TYPES.PlainClassConverter
  );

  const selectUsersAction = (users: User[]) => {
    const addedUsers: User[] = [];
    const addStatus = users.map(async (user) => {
      if (!group.users.some((val) => val.getKey() === user.getKey())) {
        const { status } = await _groupService.addUser({
          username: user.username,
          groupId: group.id
        });
        if (status === HttpStatus.CREATED) {
          addedUsers.push(user);
          return 'Added';
        } else {
          return `Erro ao adicionar o usuário ${user.getTitle()}`;
        }
      } else {
        return 'Added';
      }
    });
    Promise.all(addStatus).then((status) => {
      setGroup((oldGroup) => {
        return { ...oldGroup, users: [...oldGroup.users, ...addedUsers] };
      });
      const errors = status.filter((stat) => stat !== 'Added');
      if (errors.length === 0) {
        openAlert({
          severity: 'success',
          message: 'Usuários adicionados com sucesso!'
        });
      } else {
        openAlert({
          severity: 'warning',
          message: 'Ocorreu um erro ao adicionar usuários'
        });
      }
    });
    addUsersRef.current.handleClose();
  };

  const removeUser = (user: User) => {
    confirm({
      title: 'Remoção de usuário do grupo',
      message: `Deseja mesmo remover o usuário ${user.getTitle()} do grupo?`
    }).then(async () => {
      const { status, data } = await _groupService.removeUser({
        username: user.username,
        groupId: group.id
      });
      if (status === HttpStatus.NO_CONTENT) {
        setGroup((oldGroup) => {
          return {
            ...oldGroup,
            users: oldGroup.users.filter(
              (val) => val.getKey() !== user.getKey()
            )
          };
        });
        openAlert({
          severity: 'success',
          message: 'Usuário removido do grupo'
        });
      } else if (status === HttpStatus.FORBIDDEN) {
        openAlert({
          severity: 'warning',
          message: data.message
        });
      }
    });
  };

  useEffect(() => {
    async function getData() {
      if (destination instanceof Group) {
        const { status, data } = await _groupService.getGroupInfo(
          destination.id
        );
        if (open && status === HttpStatus.OK) {
          setGroup(_plainClassConverter.plainToClass(Group, data));
        }
      }
    }
    let open = true;
    getData();
    return () => {
      open = false;
    };
  }, [destination, _groupService, _plainClassConverter]);
  return destination instanceof Group ? (
    <>
      <Stack spacing={2} sx={{ p: 2, flex: 1 }}>
        <Stack direction="row" justifyContent="space-between">
          <Typography variant="h6">Usuários do grupo</Typography>
          <Button
            variant="contained"
            onClick={() => addUsersRef.current.handleOpenFindUserModal(true)}
          >
            Adicionar Usuários
          </Button>
        </Stack>
        <List>
          <Divider variant="inset" component="li" />
          {group.users.map((user) => (
            <React.Fragment key={user.getKey()}>
              <GroupUserCard user={user} removeAction={removeUser} />
              <Divider variant="inset" component="li" />
            </React.Fragment>
          ))}
        </List>
      </Stack>
      <FindUserModal ref={addUsersRef} selectUsersAction={selectUsersAction} />
    </>
  ) : null;
};

export default ShowGroupInfo;
