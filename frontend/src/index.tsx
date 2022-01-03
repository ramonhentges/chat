import ReactDOM from 'react-dom';
import '@fontsource/roboto';
import 'reflect-metadata';
import React from 'react';
import MyRoutes from './routes/routes';
import { MyThemeProvider } from './contexts/MyTheme';
import { AuthProvider } from './contexts/Auth';
import { AlertProvider } from './contexts/AlertSnackbar';
import { ConfirmProvider } from './contexts/ConfirmDialog';
import { Provider } from 'inversify-react';
import { container } from './config/inversify.config';

ReactDOM.render(
  <Provider container={container}>
    <MyThemeProvider>
      <AlertProvider>
        <ConfirmProvider>
          <AuthProvider>
            <MyRoutes />
          </AuthProvider>
        </ConfirmProvider>
      </AlertProvider>
    </MyThemeProvider>
  </Provider>,
  document.getElementById('root')
);
