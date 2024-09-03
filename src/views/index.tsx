import { useState } from "react";
import { useNavigate, type RouteObject } from "react-router-dom";

import MapEditor from "@/components/core/map-editor";
import { Box, Button, Checkbox, Divider, GlobalStyles, IconButton, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Stack } from "@mui/material";
import BaseLayout from "@/components/core/layout/base";

import { ArrowForward, Delete } from "@mui/icons-material";

import { ExtendFeatureCollection } from "@/components/core/map-editor/types";
import { decodeFile } from "@/lib/convert";
import ImportDialog from "@/components/core/file-list/import-dialog";
import SyncDataMenu from "@/components/core/sync-data-menu";

export default function App() {
  const [routes, setRoutes] = useState<any>([]);
  const [files, setFiles] = useState<File[]>([])
  const [active, setActive] = useState<File | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false);
  const route = useNavigate();

  async function fileChangeHandler(idx: number = 0) {
    const actives: any[] = []
    for (const file of files) {
      const content: ExtendFeatureCollection = await decodeFile(file)
      content.properties = {
        id: btoa(file.name),
        name: file.name,
        active: false
      }
      if (idx === files.indexOf(file)) {
        content.properties.active = true
      } else {
        content.properties.active = false
      }
      actives.push(content)
    }
    setRoutes(actives)
  }

  function removeHandler(file: File) {
    const newFiles = files.filter((item) => item.name !== file.name)
    setFiles(newFiles)
    fileChangeHandler();
  }

  function onSelectHandler(file: File, idx: number) {
    setActive(file)
    fileChangeHandler(idx)
  }

  function onDialogClose(values: File[], open: boolean) {
    setFiles(values);
    setDialogOpen(open);
  }

  function sysDataMenuEventHandler(event: string, data?: any) {
    switch (event) {
      case 'dialog':
        setDialogOpen(true);
        break;
      case 'route':
        route(data);
        break;
    }
  }

  return (
    <>
      <BaseLayout>
        <GlobalStyles
          styles={{
            body: {
              '--MainNav-height': '56px',
              '--MainNav-zIndex': 1000,
              '--SideNav-width': '280px',
              '--SideNav-zIndex': 1100,
              '--MobileNav-width': '320px',
              '--MobileNav-zIndex': 1100,
            },
          }}
        />
        <Box
          sx={{
            bgcolor: 'var(--mui-palette-background-default)',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            minHeight: '100%',
          }}
        >
          <Box
            sx={{
              '--SideNav-background': 'var(--mui-palette-neutral-950)',
              '--SideNav-color': 'var(--mui-palette-common-white)',
              '--NavItem-color': 'var(--mui-palette-neutral-300)',
              '--NavItem-hover-background': 'rgba(255, 255, 255, 0.04)',
              '--NavItem-active-background': 'var(--mui-palette-primary-main)',
              '--NavItem-active-color': 'var(--mui-palette-primary-contrastText)',
              '--NavItem-disabled-color': 'var(--mui-palette-neutral-500)',
              '--NavItem-icon-color': 'var(--mui-palette-neutral-400)',
              '--NavItem-icon-active-color': 'var(--mui-palette-primary-contrastText)',
              '--NavItem-icon-disabled-color': 'var(--mui-palette-neutral-600)',
              bgcolor: 'var(--SideNav-background)',
              color: 'var(--SideNav-color)',
              display: { xs: 'none', lg: 'flex' },
              flexDirection: 'column',
              height: '100%',
              left: 0,
              maxWidth: '100%',
              position: 'fixed',
              scrollbarWidth: 'none',
              top: 0,
              width: 'var(--SideNav-width)',
              zIndex: 'var(--SideNav-zIndex)',
              '&::-webkit-scrollbar': { display: 'none' },
            }}
          >
            <Stack spacing={2} sx={{ p: 1 }}>
              <SyncDataMenu onEvent={sysDataMenuEventHandler} />
            </Stack>
            <Divider sx={{ borderColor: 'var(--mui-palette-neutral-700)' }} />
            <Box component="nav" sx={{ flex: '1 1 auto', p: '12px' }}>
              <List sx={{ width: '100%', height: '100%', bgcolor: 'var(--mui-palette-neutral-950)' }}>
                {files.map((file: File, idx: number) => {
                  const labelId = `checkbox-list-label-${file.name}`;

                  return (
                    <ListItem
                      key={file.name}
                      secondaryAction={
                        <IconButton edge="end" aria-label="delete" onClick={() => removeHandler(file)} >
                          <Delete sx={{ color: 'var(--mui-palette-text-secondary)' }} />
                        </IconButton>
                      }
                      disablePadding
                    >
                      <ListItemButton role={undefined} onClick={() => onSelectHandler(file, idx)} dense>
                        <ListItemIcon sx={{
                          minWidth: 'auto',
                        }}>
                          <Checkbox
                            edge="start"
                            tabIndex={-1}
                            disableRipple
                            inputProps={{ 'aria-labelledby': labelId }}
                          />
                        </ListItemIcon>
                        <ListItemText id={labelId} primary={file.name} />
                      </ListItemButton>
                    </ListItem>
                  );
                })}
              </List>
            </Box>
            <Divider sx={{ borderColor: 'var(--mui-palette-neutral-700)' }} />
            <Stack spacing={2} sx={{ p: '12px' }}>
              <Button
                component="a"
                endIcon={<ArrowForward fontSize="medium" />}
                fullWidth
                href="/system/integrations"
                sx={{ mt: 2 }}
                variant="contained"
              >
                Setting
              </Button>
            </Stack>
          </Box>
          <Box sx={{ display: 'flex', flex: '1 1 auto', flexDirection: 'column', pl: { lg: 'var(--SideNav-width)' } }}>
            <MapEditor routes={routes}></MapEditor>
          </Box>
        </Box>
      </BaseLayout>
      <ImportDialog open={dialogOpen} onClose={onDialogClose} />
    </>
  );
}

export const routes: RouteObject[] = [
  {
    path: "/",
    element: <App />,
  },
];
