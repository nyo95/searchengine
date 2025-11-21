'use client';

import type { ReactNode } from 'react';

import { MainLayout } from '@/components/layout/main-layout';

export function AppLayout({ children }: { children: ReactNode }) {
  return <MainLayout>{children}</MainLayout>;
}

