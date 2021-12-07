import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

interface Props {
  text: string;
  fullScreen?: boolean;
}

function Loading({ text, fullScreen }: Props) {
  return (
    <Grid
      container
      justifyContent="center"
      alignItems="center"
      sx={
        fullScreen
          ? {
              height: '100vh',
              width: '100vw',
              flexGrow: 2,
              overflowY: 'auto',
              flexWrap: 'nowrap',
              p: 2
            }
          : { flexGrow: 2, overflowY: 'auto', flexWrap: 'nowrap', p: 2 }
      }
    >
      <Typography variant="h6" color="textPrimary" sx={{ p: 2 }}>
        {text}
      </Typography>
      <CircularProgress />
    </Grid>
  );
}
export default Loading;
