import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    paper: {
      '& .MuiTextField-root': {
        marginBottom: theme.spacing(2)
      },
      padding: theme.spacing(2),
      margin: 'auto'
    },
    typography: {
      padding: theme.spacing(2),
      textAlign: 'center'
    },
    button: {
      marginLeft: theme.spacing(1),
      float: 'right'
    },
    grid: {
      minHeight: '100vh'
    },
    overflow: {
      overflowX: 'hidden',
      overflowY: 'hidden'
    },
    loginGrid: {
      width: '100%'
    },
    createAccountText: {
      fontSize: '1rem',
      float: 'right',
      marginRight: theme.spacing(1)
    },
    accessText: {
      marginBottom: theme.spacing(2)
    },
    createAccountGrid: {
      width: '100%',
      float: 'right',
      marginTop: theme.spacing(3),
      marginBottom: theme.spacing(3),
      marginRight: theme.spacing(1)
    }
  })
);

export default useStyles;
