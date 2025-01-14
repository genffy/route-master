import React, { useState } from "react";
import { Button } from "@mui/material";
import { Logo } from "./logo";

export default function SyncDataMenu({ onEvent }: { onEvent: (type: string, data?: any) => void }) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  return (
    <>
      <Button
        id='sync-data-button'
        startIcon={<Logo color="light" height={16} width={16} />}
        fullWidth
        aria-controls={open ? 'sync-data-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        sx={{ justifyContent: 'space-between' }}
        variant="contained"
        onClick={handleClick}

      >Select Folder</Button>
    </>
  );
}
