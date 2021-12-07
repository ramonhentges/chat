import React, { useContext, useState } from 'react';
import Snackbar, {
  SnackbarProps,
  SnackbarCloseReason
} from '@mui/material/Snackbar';
import Alert, { AlertProps } from '@mui/material/Alert';
import { defaultAnchorOrigin } from '../../constants/theme';

type Props = {
  severity: AlertProps['severity'];
  message: string;
  anchorOrigin?: SnackbarProps['anchorOrigin'];
};

interface AlertContextProps {
  openAlert: (props: Props) => void;
}

const AlertContext = React.createContext<AlertContextProps>(
  {} as AlertContextProps
);

export const AlertProvider: React.FC = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [props, setProps] = useState<Props>({
    severity: 'error',
    message: ''
  });

  const openAlert = (props: Props) => {
    setProps(props);
    setOpen(true);
  };

  const handleClose = (reason?: SnackbarCloseReason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };

  return (
    <AlertContext.Provider value={{ openAlert }}>
      {children}
      <Snackbar
        anchorOrigin={props.anchorOrigin || defaultAnchorOrigin}
        open={open}
        autoHideDuration={4000}
        onClose={(event, reason) => handleClose(reason)}
      >
        <Alert
          elevation={6}
          variant="filled"
          onClose={() => handleClose()}
          severity={props.severity}
        >
          {props.message}
        </Alert>
      </Snackbar>
    </AlertContext.Provider>
  );
};

export const useAlert = () => useContext(AlertContext);
