import {
  createTheme,
  Palette,
  SnackbarProps,
  ThemeOptions
} from '@mui/material';
import { ptBR } from '@mui/material/locale';

export const defaultAnchorOrigin: SnackbarProps['anchorOrigin'] = {
  vertical: 'bottom',
  horizontal: 'center'
};

interface IPalette extends Palette {
  default: {
    light: string;
    main: string;
    contrastText: string;
    dark: string;
  };
}

interface IThemeOptions extends ThemeOptions {
  palette: IPalette;
}
export const light = createTheme(
  {
    palette: {
      mode: 'light',
      secondary: {
        main: '#7e57c2'
      },
      default: {
        light: '#d5d5d5',
        main: '#e0e0e0',
        dark: '#d5d5d5',
        contrastText: 'rgba(0,0,0,0.87)'
      }
    }
  } as IThemeOptions,
  ptBR
);

export const dark = createTheme(
  {
    palette: {
      mode: 'dark',
      primary: {
        main: '#ff5722'
      },
      secondary: {
        main: '#f57f17'
      },
      default: {
        light: '#d5d5d5',
        main: '#e0e0e0',
        dark: '#d5d5d5',
        contrastText: 'rgba(0,0,0,0.87)'
      }
    }
  } as IThemeOptions,
  ptBR
);
