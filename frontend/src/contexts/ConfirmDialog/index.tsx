import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import React, { useCallback, useContext, useState } from 'react';

const defaultOptions = {
  title: 'Aviso de exclusão',
  message: 'Deseja mesmo excluir?'
};

interface Props {
  title?: string;
  message?: string;
}

interface ConfirmContextProps {
  confirm: (props?: Props) => Promise<unknown>;
}

const ConfirmContext = React.createContext<ConfirmContextProps>(
  {} as ConfirmContextProps
);

export const ConfirmProvider: React.FC = ({ children }) => {
  const [props, setProps] = useState<Props>(defaultOptions);
  const [resolveReject, setResolveReject] = useState<any[]>([]);
  const [resolve, reject] = resolveReject;

  const confirm = useCallback((props?: Props) => {
    return new Promise((resolve, reject) => {
      setProps({ ...defaultOptions, ...props });
      setResolveReject([resolve, reject]);
    });
  }, []);

  const handleClose = useCallback(() => {
    setResolveReject([]);
  }, []);

  const handleCancel = useCallback(() => {
    reject();
    handleClose();
  }, [reject, handleClose]);

  const handleConfirm = useCallback(() => {
    resolve();
    handleClose();
  }, [resolve, handleClose]);

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      <Dialog
        open={resolveReject.length === 2}
        onClose={handleClose}
        aria-labelledby="alert-confirm-title"
        aria-describedby="alert-confirm-description"
      >
        <DialogTitle id="alert-confirm-title">{props.title}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-confirm-description">
            {props.message}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="inherit">
            Não
          </Button>
          <Button onClick={handleConfirm} color="primary" autoFocus>
            Sim
          </Button>
        </DialogActions>
      </Dialog>
    </ConfirmContext.Provider>
  );
};

export const useConfirm = () => useContext(ConfirmContext);
