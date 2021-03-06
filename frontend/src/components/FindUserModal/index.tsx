import { Send } from '@mui/icons-material';
import {
  Button,
  Checkbox,
  Grid,
  IconButton,
  Modal,
  Paper,
  Stack,
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
import {
  ForwardedRef,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState
} from 'react';
import { useGetAllUsers } from '../../hooks/useGetAllUsers';
import { User } from '../../models/user';
import Loading from '../Loading';

type Props = {
  selectUserAction?: (user: User) => void;
  selectUsersAction?: (user: User[]) => void;
};

const FindUserModal = forwardRef(
  (
    { selectUserAction, selectUsersAction }: Props,
    ref: ForwardedRef<unknown>
  ) => {
    const [open, setOpen] = useState(false);
    const [username, setUsername] = useState('');
    const [usersSearch, setUsersSearch] = useState<User[]>([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
    const [selectMany, setSelectMany] = useState(false);
    const { users, loading: loadingUsers } = useGetAllUsers();

    useEffect(() => {
      setUsersSearch(users);
    }, [users]);

    useEffect(() => {
      if (!open) {
        setUsername('');
        setUsersSearch(users);
      }
    }, [open, users]);

    useEffect(() => {
      setPage(0);
      setUsersSearch(
        users.filter((user) => {
          return (
            user.fullName.toLowerCase().includes(username.toLowerCase()) ||
            user.username.toLowerCase().includes(username.toLowerCase())
          );
        })
      );
    }, [username, users]);

    const handleOpen = (selectMany: boolean) => {
      setSelectMany(selectMany);
      setSelectedUsers([]);
      setOpen(true);
    };

    const handleClose = () => {
      setOpen(false);
    };

    const selectUser = (user: User) => {
      selectUserAction && selectUserAction(user);
    };

    const selectUsers = () => {
      selectUsersAction && selectUsersAction(selectedUsers);
    };

    const addUser = (user: User) => {
      setSelectedUsers((users) => [...users, user]);
    };

    const removeUser = (user: User) => {
      setSelectedUsers((users) =>
        users.filter((val) => val.getKey() !== user.getKey())
      );
    };

    function handleSearchChange(event: React.ChangeEvent<HTMLInputElement>) {
      event.preventDefault();
      setUsername(event.target.value);
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

    useImperativeHandle(ref, () => {
      return {
        handleOpenFindUserModal: handleOpen,
        handleClose: handleClose
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
              {loadingUsers ? (
                <Loading text="Carregando" />
              ) : (
                <>
                  <Grid item sx={{ mb: 2 }}>
                    <TextField
                      fullWidth
                      id="username"
                      name="username"
                      label="Nome de Usu??rio"
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
                            <TableCell align="left">Usu??rio</TableCell>
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
                                  {selectMany ? (
                                    <Checkbox
                                      checked={selectedUsers.some(
                                        (value) =>
                                          value.getKey() === user.getKey()
                                      )}
                                      onChange={(e, checked) =>
                                        checked
                                          ? addUser(user)
                                          : removeUser(user)
                                      }
                                      inputProps={{
                                        'aria-label': 'controlled'
                                      }}
                                    />
                                  ) : (
                                    <IconButton
                                      edge="end"
                                      aria-label="tests"
                                      component="a"
                                      onClick={() => {
                                        selectUser(user);
                                      }}
                                    >
                                      <Send fontSize="small" />
                                    </IconButton>
                                  )}
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
                              labelRowsPerPage="Pessoas por p??gina:"
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
                  <Grid item container sx={{ mt: 2 }} justifyContent="right">
                    <Stack spacing={2} direction="row">
                      <Button
                        variant="contained"
                        color="default"
                        onClick={handleClose}
                      >
                        Fechar
                      </Button>
                      {selectMany && (
                        <Button variant="contained" onClick={selectUsers}>
                          Selecionar
                        </Button>
                      )}
                    </Stack>
                  </Grid>
                </>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Modal>
    );
  }
);

export default FindUserModal;
