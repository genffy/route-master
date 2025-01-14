import * as React from 'react';

import '@/styles/global.css';

import { LocalizationProvider } from '@/components/localization-provider';
import { ThemeProvider } from '@/components/theme-provider/theme-provider';

export const viewport = { width: 'device-width', initialScale: 1 };

export interface BaseLayoutProps {
  children: React.ReactNode;
}

export default function BaseLayout({ children }: BaseLayoutProps): React.JSX.Element {
  return (
    <LocalizationProvider>
      <ThemeProvider>
        {children}
      </ThemeProvider>
    </LocalizationProvider>
  );
}
