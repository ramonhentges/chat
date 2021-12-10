import {
  createTheme,
  CssBaseline,
  ThemeProvider as ThemeProviderCore
} from '@mui/material';
import React, { useContext, useEffect, useState } from 'react';
import { dark, light } from '../../constants/theme';

type ContextProps = {
  changeTheme: () => void;
  mode: 'light' | 'dark';
};

const MyThemeContext = React.createContext<ContextProps>({} as ContextProps);

export const MyThemeProvider: React.FC = ({ children }) => {
  const [mode, setMode] = useState<'light' | 'dark'>('light');
  const theme = React.useMemo(
    () => createTheme(mode === 'light' ? light : dark),
    [mode]
  );
  useEffect(() => {
    if (localStorage.getItem('colorMode') === null) {
      if (
        window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: dark)').matches
      ) {
        localStorage.setItem('colorMode', 'dark');
      } else {
        localStorage.setItem('colorMode', 'light');
      }
    }
    setMode(localStorage.getItem('colorMode') === 'light' ? 'light' : 'dark');
  }, []);
  const changeTheme = () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    localStorage.setItem('colorMode', newMode);
    setMode(newMode);
  };
  return (
    <MyThemeContext.Provider value={{ mode, changeTheme }}>
      <ThemeProviderCore theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProviderCore>
    </MyThemeContext.Provider>
  );
};

export const useMyTheme = () => useContext(MyThemeContext);
