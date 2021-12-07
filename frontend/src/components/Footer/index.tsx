import React from 'react';
import { Typography, Grid } from '@mui/material';
import Link from '@mui/material/Link';

function Copyright() {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      {'Feito por '}
      <Link color="inherit" href="https://github.com/ramonhentges">
        Ramon Hentges
      </Link>
      {'.'}
    </Typography>
  );
}

export default function Footer() {
  return (
    <Grid sx={{ m: 2 }}>
      <footer>
        <Copyright />
      </footer>
    </Grid>
  );
}
