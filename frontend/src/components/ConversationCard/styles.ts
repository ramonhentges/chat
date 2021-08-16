import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      marginBottom: theme.spacing(0.3)
    },
    avatar: {
      backgroundColor: theme.palette.secondary.main
    }
  })
);

export default useStyles;
