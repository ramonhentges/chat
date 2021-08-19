import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    fab: {
      position: "absolute",
      bottom: theme.spacing(2),
      right: theme.spacing(2),
    },
  })
);

export default useStyles;
