'use client';

import { type ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  // All auth pages have their own layout - just pass through
  return <>{children}</>;
}
