import { Delete } from '@mui/icons-material';
import {
  Avatar,
  IconButton,
  ListItem,
  ListItemAvatar,
  ListItemText
} from '@mui/material';
import { User } from '../../../models/user';

type Props = {
  user: User;
  removeAction: (user: User) => void;
};

const GroupUserCard = ({ user, removeAction }: Props) => {
  return (
    <ListItem
      secondaryAction={
        <IconButton
          edge="end"
          aria-label="delete"
          onClick={() => removeAction(user)}
        >
          <Delete />
        </IconButton>
      }
    >
      <ListItemAvatar>
        <Avatar aria-label="recipe" sx={{ backgroundColor: 'secondary.main' }}>
          {user.getTitle()[0]}
        </Avatar>
      </ListItemAvatar>
      <ListItemText primary={user.getTitle()} secondary={user.getSubtitle()} />
    </ListItem>
  );
};

export default GroupUserCard;
