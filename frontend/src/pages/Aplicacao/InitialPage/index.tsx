import { Grid, Paper } from '@material-ui/core';
import React from 'react';
import ConversationCard from '../../../components/ConversationCard';
import Footer from '../../../components/Footer';
import UserCard from '../../../components/UserCard';
import useStyles from './styles';
import ConversationList from '../../../components/ConversationList';
import MessagesList from '../../../components/MessagesList';
import SendButton from '../../../components/SendButton';
import { ConversationProvider } from '../../../contexts/Conversation';
import NewConversationButton from '../../../components/NewConversationButton';

const InitialPage: React.FC = () => {
  const classes = useStyles();

  return (
    <ConversationProvider>
      <Grid
        container
        spacing={1}
        direction="column"
        justify="center"
        alignItems="center"
        alignContent="center"
        className={classes.mainGrid}
      >
        <Grid className={classes.grid}>
          <Grid container direction="row" className={classes.insideGrid}>
            <Paper className={classes.contactList}>
              <Grid item>
                <UserCard />
                <ConversationList />
                <NewConversationButton />
              </Grid>
            </Paper>

            <Paper className={classes.conversationGrid}>
              <Grid
                item
                container
                alignItems="stretch"
                direction="column"
                className={classes.conversationGrid}
                xs
              >
                <Grid item>
                  <ConversationCard />
                </Grid>
                <MessagesList />
                <SendButton />
              </Grid>
            </Paper>
          </Grid>
        </Grid>
        <Footer />
      </Grid>
    </ConversationProvider>
  );
};

export default InitialPage;
