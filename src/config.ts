import type { NavItemConfig } from '@/types/nav';
import { getSiteURL } from '@/lib/get-site-url';
import { LogLevel } from '@/lib/logger';

export interface Config {
  site: { name: string; description: string; themeColor: string; url: string };
  logLevel: keyof typeof LogLevel;
}

export const config: Config = {
  site: { name: 'Route Master', description: '', themeColor: '#090a0b', url: getSiteURL() },
  logLevel: (import.meta.env.NEXT_PUBLIC_LOG_LEVEL as keyof typeof LogLevel) ?? LogLevel.ALL,
};

export const paths = {
  home: '/',
  auth: {
    signIn: '/auth/sign-in',
    signUp: '/auth/sign-up',
    resetPassword: '/auth/reset-password'
  },
  dashboard: {
    overview: '/dashboard',
    records: '/dashboard/records',
  },
  system: {
    account: '/system/account',
    integrations: '/system/integrations',
    settings: '/system/settings',
  },
  errors: {
    notFound: '/errors/not-found',
    error: '/errors/error-page',
  },
} as const;

export const mainNavItems = [
  { key: 'overview', title: 'Overview', href: paths.dashboard.overview, icon: 'chart-pie' },
  { key: 'customers', title: 'Customers', href: paths.dashboard.records, icon: 'users' },
] satisfies NavItemConfig[];

export const systemNavItems = [
  { key: 'integrations', title: 'Integrations', href: paths.system.integrations, icon: 'plugs-connected' },
  { key: 'settings', title: 'Settings', href: paths.system.settings, icon: 'gear-six' },
  { key: 'account', title: 'Account', href: paths.system.account, icon: 'user' }
] satisfies NavItemConfig[];
