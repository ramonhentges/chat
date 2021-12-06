import React, { ForwardedRef, forwardRef, useImperativeHandle } from 'react';
import Snackbar, { SnackbarProps } from '@material-ui/core/Snackbar';
import MuiAlert, { AlertProps } from '@material-ui/lab/Alert';

function Alert(props: AlertProps) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

type Props = {
  severity: AlertProps['severity'];
  message?: string;
  anchorOrigin?: SnackbarProps['anchorOrigin'];
};

const AlertSnackbar = forwardRef((props: Props, ref: ForwardedRef<unknown>) => {
  const [open, setOpen] = React.useState(false);
  const [message, setMessage] = React.useState(props.message);

  const handleOpen = () => {
    setOpen(true);
  };
  const handleOpenMessage = (message: string) => {
    setMessage(message);
    setOpen(true);
  };

  const handleClose = (event?: React.SyntheticEvent, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };

  useImperativeHandle(ref, () => {
    return {
      handleOpenSnackbar: handleOpen,
      handleOpenMessage
    };
  });

  return (
    <Snackbar
      anchorOrigin={props.anchorOrigin}
      open={open}
      autoHideDuration={6000}
      onClose={handleClose}
    >
      <Alert onClose={handleClose} severity={props.severity}>
        {message}
      </Alert>
    </Snackbar>
  );
});

export default AlertSnackbar;
