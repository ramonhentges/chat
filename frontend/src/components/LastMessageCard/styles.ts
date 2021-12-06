import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    notSelected: {
      width: 300,
      marginBottom: theme.spacing(0.3)
    },
    selected: {
      width: 300,
      marginBottom: theme.spacing(0.3),
      backgroundColor: theme.palette.secondary.main
    },
    showTime: {
      marginTop: -theme.spacing(3),
      paddingRight: theme.spacing(1)
    }
  })
);

export default useStyles;
