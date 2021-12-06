import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    messageGrid: {
      maxWidth: '65%',
      marginBottom: theme.spacing(1)
    },
    message: {
      padding: theme.spacing(1),
      height: '100%'
    }
  })
);

export default useStyles;
