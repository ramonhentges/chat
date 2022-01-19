import { Close } from '@mui/icons-material';
import {
  Grid,
  IconButton,
  Modal,
  Paper,
  Stack,
  Typography
} from '@mui/material';
import React, {
  ForwardedRef,
  forwardRef,
  useImperativeHandle,
  useState
} from 'react';
import { IMessage } from '../../interfaces/i-message';

const ShowMessageInfoModal = forwardRef((props, ref: ForwardedRef<unknown>) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState<IMessage>();

  const handleClose = () => {
    setOpen(false);
  };

  const handleOpen = (message: IMessage) => {
    setMessage(message);
    setOpen(true);
  };

  useImperativeHandle(ref, () => {
    return {
      handleOpen: handleOpen
    };
  });

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="message info"
      aria-describedby="modal to show message info"
    >
      <Grid
        container
        justifyContent="center"
        alignContent="center"
        alignItems="center"
        style={{ height: '100vh' }}
      >
        <Grid item md={6} sm={8} xs={12}>
          <Paper sx={{ p: 2 }}>
            <Stack spacing={2} sx={{ mb: 2 }}>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="h5">Informações da mensagem</Typography>
                <IconButton onClick={handleClose}>
                  <Close />
                </IconButton>
              </Stack>
              <Typography variant="body1">{message?.getMessage()}</Typography>
              <Typography variant="caption">{`Enviada em: ${message?.createdAt.toLocaleString()}`}</Typography>
              <Typography>Lido Por:</Typography>
              {message?.readedBy.length === 0 ? (
                <Typography typography="body1">Mensagem não lida</Typography>
              ) : (
                message?.readedBy.map((readedBy) => (
                  <Paper key={readedBy.id} elevation={3} sx={{ p: 2 }}>
                    <Typography variant="body1">
                      {readedBy.user.getTitle()}
                    </Typography>
                    <Typography variant="caption">
                      {readedBy.readedAt.toLocaleString()}
                    </Typography>
                  </Paper>
                ))
              )}
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Modal>
  );
});

export default ShowMessageInfoModal;
