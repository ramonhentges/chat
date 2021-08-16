import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";

const useStyles = makeStyles((theme: Theme) => createStyles({
  footer: {
    margin: theme.spacing(2),
  }
}));

export default useStyles;
