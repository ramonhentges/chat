import ReactDOM from 'react-dom';
import '@fontsource/roboto';
import 'reflect-metadata';
import React from 'react';
import Routes from './routes/routes';
import { MyThemeProvider } from './contexts/MyTheme';
import { AuthProvider } from './contexts/Auth';
import { AlertProvider } from './contexts/AlertSnackbar';
import { ConfirmProvider } from './contexts/ConfirmDialog';

ReactDOM.render(
  <MyThemeProvider>
    <AlertProvider>
      <ConfirmProvider>
        <AuthProvider>
          <Routes />
        </AuthProvider>
      </ConfirmProvider>
    </AlertProvider>
  </MyThemeProvider>,
  document.getElementById('root')
);
