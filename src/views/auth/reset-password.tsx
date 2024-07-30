import * as React from 'react';

import { config } from '@/config';
import { ResetPasswordForm } from '@/components/auth/reset-password-form';

export const metadata = { title: `Reset password | Auth | ${config.site.name}` };

export default function Page(): React.JSX.Element {
  return (<ResetPasswordForm />);
}
