'use client';

import { SidebarMenu } from '@/components/navigation/sidebar-menu';

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <div className="hidden w-[280px] flex-shrink-0 lg:block">
        <div className="sticky top-6 p-6">
          <SidebarMenu className="w-full" />
        </div>
      </div>
      <main className="flex-1">{children}</main>
    </div>
  );
}

