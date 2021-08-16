import { createMuiTheme, CssBaseline, ThemeProvider } from "@material-ui/core";
import React, { useContext, useEffect, useState } from "react";
import { dark, light } from "../../constants/theme";

type ContextProps = {
  changeTheme: () => void;
  theme: boolean;
};

const MyThemeContext = React.createContext<ContextProps>({} as ContextProps);

export const MyThemeProvider: React.FC = ({ children }) => {
  const [theme, setTheme] = useState(
    localStorage.getItem("darkMode") === "true"
  );
  const appliedTheme = createMuiTheme(theme ? dark : light);
  useEffect(() => {
    if (localStorage.getItem("darkMode") === null) {
      if (
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
      ) {
        localStorage.setItem("darkMode", "true");
      } else {
        localStorage.setItem("darkMode", "false");
      }
    }
    setTheme(localStorage.getItem("darkMode") === "true");
  }, []);
  const changeTheme = () => {
    localStorage.setItem("darkMode", `${!theme}`);
    setTheme(!theme);
  };
  return (
    <MyThemeContext.Provider value={{ theme, changeTheme }}>
      <ThemeProvider theme={appliedTheme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </MyThemeContext.Provider>
  );
};

export const useMyTheme = () => useContext(MyThemeContext);
