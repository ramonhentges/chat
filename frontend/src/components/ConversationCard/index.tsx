import React from 'react';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Avatar from '@mui/material/Avatar';
import { useConversation } from '../../contexts/Conversation';
import { IconButton } from '@mui/material';
import { Close } from '@mui/icons-material';
import { Group } from '../../models/group';

export default function ConversationCard() {
  const { destination, setShowInfo, showInfo } = useConversation();

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
              destination instanceof Group ? () => setShowInfo(true) : undefined
            }
          >
            {destination.getTitle()[0]}
          </Avatar>
        }
        title={destination.getTitle()}
        subheader={destination.getSubtitle()}
        titleTypographyProps={{ color: 'secondary' }}
        action={
          showInfo && (
            <IconButton
              onClick={() => setShowInfo(false)}
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
