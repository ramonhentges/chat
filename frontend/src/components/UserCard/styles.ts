import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: 300,
      marginBottom: theme.spacing(0.3)
    },
    avatar: {
      backgroundColor: theme.palette.primary.main
    }
  })
);

export default useStyles;
