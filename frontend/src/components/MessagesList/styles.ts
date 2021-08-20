import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    messagesGrid: {
      flexGrow: 2,
      overflowY: "auto",
      flexWrap: "nowrap",
      padding: theme.spacing(2),
    },
    date: {
      alignSelf: "center",
      marginBottom: theme.spacing(2),
    },
  })
);

export default useStyles;
