import * as React from 'react';

import { Outlet } from 'react-router-dom';
import { Box, Container } from '@mui/material';
import { SideNav } from '@/components/core/layout/side-nav';
// import { MainNav } from '@/components/core/layout/main-nav';
import Layout from '../core/layout';
import { systemNavItems } from '@/config';

export const viewport = { width: 'device-width', initialScale: 1 };

export default function SystemLayout(): React.JSX.Element {
  return (
    <Layout>
      <SideNav navItems={systemNavItems} />
      <Box sx={{ display: 'flex', flex: '1 1 auto', flexDirection: 'column', pl: { lg: 'var(--SideNav-width)' } }}>
        <main>
          <Container maxWidth="xl" sx={{ py: '64px' }}>
            <Outlet />
          </Container>
        </main>
      </Box>
    </Layout>
  );
}
