import { Grid, Paper } from '@mui/material';
import React from 'react';
import ConversationCard from '../../../components/ConversationCard';
import Footer from '../../../components/Footer';
import UserCard from '../../../components/UserCard';
import ConversationList from '../../../components/ConversationList';
import MessagesList from '../../../components/MessagesList';
import SendButton from '../../../components/SendButton';
import { useConversation } from '../../../contexts/Conversation';
import NewConversationButton from '../../../components/NewConversationButton';
import ShowGroupInfo from '../../../components/ShowGroupInfo';

const InitialPage: React.FC = () => {
  const { showInfo } = useConversation();
  return (
    <Grid
      container
      spacing={1}
      direction="column"
      justifyContent="center"
      alignItems="center"
      alignContent="center"
      sx={{
        height: '100vh',
        width: '100vw',
        minWidth: '750px',
        minHeight: '500px',
        flexWrap: 'nowrap'
      }}
    >
      <Grid
        sx={{
          height: '85%',
          width: '90%',
          overflowX: 'hidden',
          overflowY: 'hidden'
        }}
      >
        <Grid container direction="row" sx={{ height: '100%', width: '100%' }}>
          <Paper
            sx={{
              height: '100%',
              overflowX: 'hidden',
              overflowY: 'auto',
              width: 300,
              minWidth: 200,
              marginRight: 2,
              position: 'relative'
            }}
          >
            <Grid item>
              <UserCard />
              <ConversationList />
              <NewConversationButton />
            </Grid>
          </Paper>

          <Paper sx={{ flexGrow: 2, height: '100%', flexWrap: 'nowrap' }}>
            <Grid
              item
              container
              alignItems="stretch"
              direction="column"
              sx={{ flexGrow: 2, height: '100%', flexWrap: 'nowrap' }}
              xs
            >
              <Grid item>
                <ConversationCard />
              </Grid>
              {showInfo ? (
                <ShowGroupInfo />
              ) : (
                <>
                  <MessagesList />
                  <SendButton />
                </>
              )}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
      <Footer />
    </Grid>
  );
};

export default InitialPage;
