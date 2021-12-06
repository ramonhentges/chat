import CircularProgress from '@material-ui/core/CircularProgress';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import useStyles from './styles';

interface Props {
  text: string;
  fullScreen?: boolean;
}

function Loading({ text, fullScreen }: Props) {
  const classes = useStyles();
  return (
    <Grid
      container
      justify="center"
      alignItems="center"
      className={fullScreen ? classes.gridFullScreen : classes.grid}
    >
      <Typography variant="h6" color="textPrimary" className={classes.padding}>
        {text}
      </Typography>
      <CircularProgress />
    </Grid>
  );
}
export default Loading;
