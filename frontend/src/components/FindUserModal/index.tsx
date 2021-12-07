import {
  Grid,
  IconButton,
  Modal,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography
} from '@mui/material';
import { Send } from '@mui/icons-material';
import {
  ForwardedRef,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState
} from 'react';
import { useConversation } from '../../contexts/Conversation';
import { User } from '../../models/user';
import { usersList } from '../../services/user.service';
import Loading from '../Loading';
import { plainToInstance } from 'class-transformer';

const FindUserModal = forwardRef((props, ref: ForwardedRef<unknown>) => {
  const { setDestination } = useConversation();
  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState<boolean>(true);
  const [usersSearch, setUsersSearch] = useState<User[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const sendMessage = (user: User) => {
    setDestination(user);
    setOpen(false);
  };
  function handleSearchChange(event: React.ChangeEvent<HTMLInputElement>) {
    event.preventDefault();
    setUsername(event.target.value);
    setPage(0);
    setUsersSearch(
      users.filter((user) => {
        return (
          user.fullName
            .toLowerCase()
            .includes(event.target.value.toLowerCase()) ||
          user.username.toLowerCase().includes(event.target.value.toLowerCase())
        );
      })
    );
  }

  const handleChangePage = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  useEffect(() => {
    const fetchData = async () => {
      const { data, status } = await usersList();
      if (status && status === 200 && open) {
        setUsers(plainToInstance(User, data as []));
        setUsersSearch(plainToInstance(User, data as []));
        setLoading(false);
      }
    };
    open && fetchData();
    return () => {
      setLoading(true);
      setUsername('');
    };
  }, [open]);

  useImperativeHandle(ref, () => {
    return {
      handleOpenFindUserModal: handleOpen
    };
  });

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="user search"
      aria-describedby="modal to search user"
    >
      <Grid
        container
        justifyContent="center"
        alignContent="center"
        alignItems="center"
        style={{ height: '100vh' }}
      >
        <Grid item xs={8}>
          <Paper sx={{ p: 2 }}>
            <Grid item sx={{ mb: 2 }}>
              <Typography variant="h5">Buscar Contato</Typography>
            </Grid>
            {loading ? (
              <Loading text="Carregando" />
            ) : (
              <>
                <Grid item sx={{ mb: 2 }}>
                  <TextField
                    fullWidth
                    id="username"
                    name="username"
                    label="Nome de Usuário"
                    variant="outlined"
                    value={username}
                    onChange={handleSearchChange}
                  />
                </Grid>
                <Grid item>
                  <TableContainer>
                    <Table size="small" aria-label="simple table">
                      <TableHead>
                        <TableRow>
                          <TableCell>Nome Completo</TableCell>
                          <TableCell align="left">Usuário</TableCell>
                          <TableCell align="right"></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {(rowsPerPage > 0
                          ? usersSearch.slice(
                              page * rowsPerPage,
                              page * rowsPerPage + rowsPerPage
                            )
                          : usersSearch
                        ).map((user) => {
                          return (
                            <TableRow key={user.username}>
                              <TableCell component="th" scope="row">
                                {user.fullName}
                              </TableCell>
                              <TableCell align="left">
                                {user.username}
                              </TableCell>
                              <TableCell align="right">
                                <IconButton
                                  edge="end"
                                  aria-label="tests"
                                  component="a"
                                  onClick={() => {
                                    sendMessage(user);
                                  }}
                                >
                                  <Send fontSize="small" />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                      <TableFooter>
                        <TableRow>
                          <TablePagination
                            rowsPerPageOptions={[10, 25]}
                            colSpan={3}
                            count={usersSearch.length}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            labelRowsPerPage="Pessoas por página:"
                            SelectProps={{
                              inputProps: { 'aria-label': 'rows per page' },
                              native: true
                            }}
                            onPageChange={handleChangePage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                          />
                        </TableRow>
                      </TableFooter>
                    </Table>
                  </TableContainer>
                </Grid>
              </>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Modal>
  );
});

export default FindUserModal;
