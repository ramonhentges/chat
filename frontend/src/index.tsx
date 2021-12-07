import ReactDOM from 'react-dom';
import '@fontsource/roboto';
import 'reflect-metadata';
import React from 'react';
import Routes from './routes/routes';
import { MyThemeProvider } from './contexts/MyTheme';
import { AuthProvider } from './contexts/Auth';

ReactDOM.render(
  <MyThemeProvider>
    <AuthProvider>
      <Routes />
    </AuthProvider>
  </MyThemeProvider>,
  document.getElementById('root')
);
