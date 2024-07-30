import * as React from 'react';

import { config } from '@/config';
import { SignUpForm } from '@/components/auth/sign-up-form';

export const metadata = { title: `Sign up | Auth | ${config.site.name}` };

export default function Page(): React.JSX.Element {
  return (
    <SignUpForm />
  );
}
