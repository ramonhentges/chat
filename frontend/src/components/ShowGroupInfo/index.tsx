import { Stack, Typography } from '@mui/material';
import { plainToInstance } from 'class-transformer';
import React, { useEffect, useState } from 'react';
import { useConversation } from '../../contexts/Conversation';
import { HttpStatus } from '../../enum/http-status.enum';
import { Group } from '../../models/group';
import { getGroupInfo } from '../../services/group.service';
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
    <Stack spacing={2}>
      {group.users.map((user) => (
        <Typography>{user.getTitle()}</Typography>
      ))}
    </Stack>
  ) : null;
};

export default ShowGroupInfo;
