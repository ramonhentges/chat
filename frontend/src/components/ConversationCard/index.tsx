import React from 'react';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Avatar from '@mui/material/Avatar';
import { useConversation } from '../../contexts/Conversation';

export default function ConversationCard() {
  const { destination } = useConversation();

  return !!destination ? (
    <Card sx={{ mb: 3 }} square={true}>
      <CardHeader
        avatar={
          <Avatar
            aria-label="recipe"
            sx={{ backgroundColor: 'secondary.main' }}
          >
            {destination.getTitle()[0]}
          </Avatar>
        }
        title={destination.getTitle()}
        subheader={destination.getSubtitle()}
        titleTypographyProps={{ color: 'secondary' }}
      />
    </Card>
  ) : (
    <></>
  );
}
