import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  padding: {
    padding: theme.spacing(2),
  },
  grid: {
    flexGrow: 2,
    overflowY: "auto",
    flexWrap: "nowrap",
    padding: theme.spacing(2),
  },
  gridFullScreen: {
    height: "100vh",
    width: "100vw",
    flexGrow: 2,
    overflowY: "auto",
    flexWrap: "nowrap",
    padding: theme.spacing(2),
  },
}));

export default useStyles;