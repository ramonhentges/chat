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
};

const GroupUserCard = ({ user }: Props) => {
  return (
    <ListItem
      secondaryAction={
        <IconButton edge="end" aria-label="delete">
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
