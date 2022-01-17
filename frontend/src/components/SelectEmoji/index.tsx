import { InsertEmoticon } from '@mui/icons-material';
import { IconButton, Popover, useTheme } from '@mui/material';
import { BaseEmoji, Picker } from 'emoji-mart';
import React, { useState } from 'react';
import { useMyTheme } from '../../contexts/MyTheme';
import 'emoji-mart/css/emoji-mart.css'

type Props = {
  addEmoji: (emoji: string) => void;
};

export const SelectEmoji = ({ addEmoji }: Props) => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const open = Boolean(anchorEl);
  const { mode } = useMyTheme();
  const { palette } = useTheme();

  function selectEmoji(emoji: BaseEmoji) {
    addEmoji(emoji.native);
  }

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <IconButton size="small" aria-label="emojis" onClick={handleClick}>
        <InsertEmoticon />
      </IconButton>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
      >
        <Picker
          theme={mode}
          color={palette.primary.main}
          native={true}
          onSelect={selectEmoji}
        />
      </Popover>
    </>
  );
};
