import { Chip, Typography } from '@mui/material';

type Props = {
  date: Date;
};

export function DateChip({ date }: Props) {
  return (
    <Chip
      sx={{ alignSelf: 'center', mb: 2 }}
      variant="outlined"
      label={
        <Typography variant="body2" style={{ whiteSpace: 'normal' }}>
          {date.toLocaleDateString()}
        </Typography>
      }
    />
  );
}
