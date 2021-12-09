import { Button, Divider, List, Stack, Typography } from '@mui/material';
import { plainToInstance } from 'class-transformer';
import React, { useEffect, useState } from 'react';
import { useConversation } from '../../contexts/Conversation';
import { HttpStatus } from '../../enum/http-status.enum';
import { Group } from '../../models/group';
import { getGroupInfo } from '../../services/group.service';
import GroupUserCard from './GroupUserCard';
const ShowGroupInfo = () => {
  const { destination } = useConversation();
  const [group, setGroup] = useState<Group>(new Group());
  useEffect(() => {
    async function getData() {
      if (destination instanceof Group) {
        const { status, data } = await getGroupInfo(destination.id);
        if (open && status === HttpStatus.OK) {
          setGroup(plainToInstance(Group, data));
        }
      }
    }
    let open = true;
    getData();
    return () => {
      open = false;
    };
  }, [destination]);
  return destination instanceof Group ? (
    <Stack spacing={2} sx={{ p: 2, flex: 1 }}>
      <Stack direction="row" justifyContent="space-between">
      <Typography variant="h6">Usuários do grupo</Typography>
      <Button variant="contained">
            Adicionar Usuários
          </Button>
          </Stack>
      <List>
        <Divider variant="inset" component="li" />
        {group.users.map((user) => (
          <React.Fragment key={user.getKey()}>
            <GroupUserCard user={user} />
            <Divider variant="inset" component="li" />
          </React.Fragment>
        ))}
      </List>
    </Stack>
  ) : null;
};

export default ShowGroupInfo;
