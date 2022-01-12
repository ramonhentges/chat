import { CheckCircle, CircleOutlined } from '@mui/icons-material';
import { Grid, SxProps, Theme, Typography } from '@mui/material';
import { useAuth } from '../../contexts/Auth';
import { useConversation } from '../../contexts/Conversation';
import { IMessage } from '../../interfaces/i-message';
import { Group } from '../../models/group';
import { ReadedBy } from '../../models/readed-by.model';
import { User } from '../../models/user';
import { formatTime } from '../../util/date';

type Props = {
  message: IMessage;
  sx?: SxProps<Theme> | undefined;
  type: 'conversation' | 'card';
};

export function ReadedInfo({ message, sx, type }: Props) {
  const { destination } = useConversation();
  const { user } = useAuth();
  const destinations = {
    conversation: destination,
    card: message.destination()
  };
  return (
    <Grid
      container
      justifyContent="right"
      alignItems="center"
      spacing={'3px'}
      sx={sx}
    >
      <Grid item>
        <Typography display="block" variant="caption">
          {formatTime(message.createdAt)}
        </Typography>
      </Grid>
      {showReaded(user, message) && (
        <Grid item>
          {isReaded(destinations[type], message.readedBy) ? (
            <CheckCircle fontSize="small" />
          ) : (
            <CircleOutlined fontSize="small" />
          )}
        </Grid>
      )}
    </Grid>
  );
}

function isReaded(
  destination: Group | User | null,
  readedBy: ReadedBy[]
): boolean {
  if (destination instanceof Group) {
    console.log(destination);
    
    if (readedBy.length >= destination.users.length - 1) {
      return true;
    }
  } else if (destination instanceof User) {
    if (readedBy.length > 0) {
      return true;
    }
  }
  return false;
}

function showReaded(user: User | null, message: IMessage): boolean {
  if (user) {
    if (user.getKey() === message.origin.getKey()) {
      return true;
    }
  }
  return false;
}
