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
import { ActualPage } from '../../../enum/actual-page';
import { ChangeUserInfo } from '../../../components/ChangeUserInfo';

const InitialPage: React.FC = () => {
  const { actualPage } = useConversation();
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
            elevation={4}
            sx={{
              height: '100%',
              overflowX: 'hidden',
              overflowY: 'auto',
              width: 300,
              minWidth: 200,
              marginRight: 2,
              borderRadius: 2
            }}
          >
            <Grid
              container
              item
              sx={{ minHeight: '100%', flexDirection: 'column' }}
            >
              <Grid item>
                <UserCard />
              </Grid>
              <Grid item sx={{ flexGrow: 2 }}>
                <ConversationList />
              </Grid>
              <NewConversationButton />
            </Grid>
          </Paper>

          <Paper
            elevation={4}
            sx={{
              flexGrow: 2,
              height: '100%',
              flexWrap: 'nowrap',
              borderRadius: 2
            }}
          >
            <Grid
              item
              container
              alignItems="stretch"
              direction="column"
              sx={{ flexGrow: 2, height: '100%', flexWrap: 'nowrap' }}
              xs
            >
              {[ActualPage.GROUP_INFO, ActualPage.CHAT].includes(
                actualPage
              ) && (
                <Grid item>
                  <ConversationCard />
                </Grid>
              )}
              {actualPage === ActualPage.GROUP_INFO ? (
                <ShowGroupInfo />
              ) : actualPage === ActualPage.CHAT ? (
                <>
                  <MessagesList />
                  <SendButton />
                </>
              ) : (
                actualPage === ActualPage.MY_USER_INFO && <ChangeUserInfo />
              )}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
      <Grid item>
        <Footer />
      </Grid>
    </Grid>
  );
};

export default InitialPage;
