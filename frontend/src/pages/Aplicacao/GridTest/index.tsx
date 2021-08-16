import {
  Box,
  Card,
  Chip,
  Container,
  Fab,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  Paper,
  TextField,
  Typography,
} from "@material-ui/core";
import React from "react";
import ConversationCard from "../../../components/ConversationCard";
import SendIcon from "@material-ui/icons/Send";

const GridTest = () => {

  return (
    <Container maxWidth="lg">
      <Grid
        container
        alignItems="stretch"
        direction="column"
        style={{ height: "100vh", flexWrap: "nowrap" }}
      >
        <Grid item style={{ backgroundColor: "#a008f2" }}>
          <ConversationCard />
        </Grid>

        <Grid
          container
          item
          alignItems="flex-start"
          direction="column"
          style={{ backgroundColor: "#0808f2", flexGrow: 2, padding: 10, overflowY: "scroll", flexWrap: "nowrap" }}
        >
          <Chip variant="outlined" label="Message 1" />
          <Chip
            variant="default"
            label="Message 2"
            style={{ alignSelf: "flex-end" }}
          />
          <Chip variant="outlined" label="Message 1" />
          <Chip variant="outlined" label="Message 1" />
          <Chip variant="outlined" label="Message 1" />
          <Chip variant="outlined" label="Message 1" />
        </Grid>

        <Grid
          item
          style={{
            backgroundColor: "#c808f2",
            padding: 10,
          }}
        >
          <FormControl fullWidth size="small" variant="outlined">
          <InputLabel htmlFor="outlined-adornment-amount">Mensagem</InputLabel>
            <OutlinedInput
              labelWidth={80}
              id="outlined-adornment-amount"
              endAdornment={
                <IconButton aria-label="search">
                  <SendIcon />
                </IconButton>
              }
            />
          </FormControl>
        </Grid>
      </Grid>
    </Container>
  );
};

export default GridTest;
