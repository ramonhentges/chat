import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    grid: {
      height: "85%",
      width: "90%",
      overflowX: "hidden",
      overflowY: "hidden",
    },
    mainGrid: {
      height: "100vh",
      width: "100vw",
      minWidth: "750px",
      minHeight: "500px",
      flexWrap: "nowrap",
    },
    insideGrid: {
      height: "100%",
      width: "100%",
    },
    contactList: {
      height: "100%",
      overflowX: "hidden",
      overflowY: "auto",
      width: 300,
      minWidth: 200,
      marginRight: theme.spacing(2),
      position: "relative",
    },
    conversationGrid: {
      flexGrow: 2,
      height: "100%",
      flexWrap: "nowrap",
    },
  })
);

export default useStyles;
