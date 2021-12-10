import React from 'react';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useAuth } from '../../contexts/Auth';
import { ListItemIcon, Menu, MenuItem, Typography } from '@mui/material';
import {
  ExitToApp as ExitIcon,
  Brightness4 as NightIcon,
  Brightness7 as DayIcon,
  AccountCircle
} from '@mui/icons-material';
import { useMyTheme } from '../../contexts/MyTheme';
import { useConversation } from '../../contexts/Conversation';
import { ActualPage } from '../../enum/actual-page';

const UserCard: React.FC = () => {
  const { user, signOut } = useAuth();
  const { mode, changeTheme } = useMyTheme();
  const { actualPage, setActualPage } = useConversation();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleChangeTheme = () => {
    changeTheme();
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Card sx={{ width: 300, mb: 0.3 }} elevation={3} square={true}>
        <CardHeader
          avatar={
            <Avatar
              aria-label="recipe"
              sx={{ backgroundColor: 'palette.primary.main' }}
            >
              {user?.getTitle()[0]}
            </Avatar>
          }
          action={
            <IconButton aria-label="settings" onClick={handleClick}>
              <MoreVertIcon />
            </IconButton>
          }
          title={user?.getTitle()}
          subheader={user?.getSubtitle()}
          titleTypographyProps={{ color: 'primary' }}
        />
      </Card>
      <Menu
        id="account-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem
          disabled={actualPage === ActualPage.MY_USER_INFO}
          onClick={() => {
            setActualPage(ActualPage.MY_USER_INFO);
            handleClose();
          }}
        >
          <ListItemIcon>
            <AccountCircle fontSize="small" />
          </ListItemIcon>
          <Typography variant="inherit">Meus Dados</Typography>
        </MenuItem>
        <MenuItem onClick={handleChangeTheme}>
          <ListItemIcon>
            {mode === 'dark' ? (
              <DayIcon fontSize="small" />
            ) : (
              <NightIcon fontSize="small" />
            )}
          </ListItemIcon>
          <Typography variant="inherit">Trocar tema</Typography>
        </MenuItem>
        <MenuItem onClick={signOut}>
          <ListItemIcon>
            <ExitIcon fontSize="small" />
          </ListItemIcon>
          <Typography variant="inherit">Sair</Typography>
        </MenuItem>
      </Menu>
    </>
  );
};

export default UserCard;
