import React from "react";
import Card from "@material-ui/core/Card";
import CardHeader from "@material-ui/core/CardHeader";
import Avatar from "@material-ui/core/Avatar";
import IconButton from "@material-ui/core/IconButton";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import useStyles from "./styles";
import { useAuth } from "../../contexts/Auth";
import { ListItemIcon, Menu, MenuItem, Typography } from "@material-ui/core";
import { ExitToApp as ExitIcon, Brightness4 as NightIcon, Brightness7 as DayIcon } from "@material-ui/icons";
import { useMyTheme } from "../../contexts/MyTheme";

const UserCard: React.FC = () => {
  const classes = useStyles();
  const { user, signOut } = useAuth();
  const { theme, changeTheme } = useMyTheme();
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
      <Card className={classes.root} elevation={3} square={true}>
        <CardHeader
          avatar={
            <Avatar aria-label="recipe" className={classes.avatar}>
              R
            </Avatar>
          }
          action={
            <IconButton aria-label="settings" onClick={handleClick}>
              <MoreVertIcon />
            </IconButton>
          }
          title={user?.fullName}
          subheader={user?.username}
          titleTypographyProps={{ color: "primary" }}
        />
      </Card>
      <Menu
        id="account-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem onClick={handleChangeTheme}>
          <ListItemIcon>
            {theme ? <DayIcon fontSize="small" /> : <NightIcon fontSize="small" />}
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
