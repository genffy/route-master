import React, { useState } from "react";
import { Menu, MenuItem, Button } from "@mui/material";
import { Logo } from "./logo";
import { KeyboardArrowDownOutlined } from "@mui/icons-material";

export default function SyncDataMenu({ onEvent }: { onEvent: (type: string, data?: any) => void }) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  function goConfigAccount() {
    onEvent('route', '/system/account');
  }

  const handleClickOpen = () => {
    handleClose();
    onEvent('dialog');
  };

  return (
    <>
      <Button
        id='sync-data-button'
        startIcon={<Logo color="light" height={16} width={16} />}
        endIcon={<KeyboardArrowDownOutlined fontSize="medium" />}
        fullWidth
        aria-controls={open ? 'sync-data-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        sx={{ justifyContent: 'space-between' }}
        variant="contained"
        onClick={handleClick}

      >Sync Data</Button>
      <Menu
        id="sync-data-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'sync-data-button',
        }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={handleClickOpen}>Upload / Import</MenuItem>
        <MenuItem onClick={goConfigAccount}>Config Account</MenuItem>
      </Menu>
    </>
  );
}
