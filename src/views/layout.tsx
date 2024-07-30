import * as React from 'react';

import '@/styles/global.css';

import { UserProvider } from '@/contexts/user-context';
import { LocalizationProvider } from '@/components/core/localization-provider';
import { ThemeProvider } from '@/components/core/theme-provider/theme-provider';
import { Outlet } from 'react-router-dom';

export const viewport = { width: 'device-width', initialScale: 1 };

export default function Layout(): React.JSX.Element {
  return (
    <LocalizationProvider>
      <UserProvider>
        <ThemeProvider>
          <Outlet />
        </ThemeProvider>
      </UserProvider>
    </LocalizationProvider>
  );
}
