import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    paper: {
      padding: theme.spacing(2)
    },
    marginBottom: {
      marginBottom: theme.spacing(2)
    }
  })
);

export default useStyles;
