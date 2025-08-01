import { createTheme as createMuiTheme } from '@mui/material/styles';

import { components } from './components/components';
import { shadows } from './shadows';
import { typography } from './typography';

export function createTheme() {
  const theme = createMuiTheme({
    breakpoints: { values: { xs: 0, sm: 600, md: 900, lg: 1200, xl: 1440 } },
    components,
    shadows,
    shape: { borderRadius: 8 },
    typography,
  });

  return theme;
}
