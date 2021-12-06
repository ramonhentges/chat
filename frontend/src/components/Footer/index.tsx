import React from 'react';
import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';
import useStyles from './styles';

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
  const classes = useStyles();
  return (
    <footer className={classes.footer}>
      <Copyright />
    </footer>
  );
}
