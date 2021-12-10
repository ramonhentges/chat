import React from 'react';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Avatar from '@mui/material/Avatar';
import { useConversation } from '../../contexts/Conversation';
import { IconButton } from '@mui/material';
import { Close } from '@mui/icons-material';
import { Group } from '../../models/group';
import { ActualPage } from '../../enum/actual-page';

export default function ConversationCard() {
  const { destination, setActualPage, actualPage } = useConversation();

  return !!destination ? (
    <Card square={true}>
      <CardHeader
        avatar={
          <Avatar
            aria-label="recipe"
            sx={
              destination instanceof Group
                ? { backgroundColor: 'secondary.main', cursor: 'pointer' }
                : { backgroundColor: 'secondary.main' }
            }
            onClick={
              destination instanceof Group
                ? () => setActualPage(ActualPage.GROUP_INFO)
                : undefined
            }
          >
            {destination.getTitle()[0]}
          </Avatar>
        }
        title={destination.getTitle()}
        subheader={destination.getSubtitle()}
        titleTypographyProps={{ color: 'secondary' }}
        action={
          actualPage === ActualPage.GROUP_INFO && (
            <IconButton
              onClick={() => setActualPage(ActualPage.CHAT)}
              aria-label="close descritpion"
            >
              <Close />
            </IconButton>
          )
        }
      />
    </Card>
  ) : (
    <></>
  );
}
