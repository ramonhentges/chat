import { createMuiTheme } from '@material-ui/core';

export const light = createMuiTheme({
  palette: {
    type: 'light',
    secondary: {
      main: '#7e57c2'
    }
  }
});

export const dark = createMuiTheme({
  palette: {
    type: 'dark',
    primary: {
      main: '#ff5722'
    },
    secondary: {
      main: '#f57f17'
    }
  }
});
