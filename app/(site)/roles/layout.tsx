import { ReactNode } from 'react';
import { Metadata } from 'next';
import { Sidebar } from '@/app/shared/layout';

export const metadata: Metadata = {
  title: 'Roles',
  description: 'Roles Xura',
};

export default function RolesLayout({ children }: { children: ReactNode }) {
  return (
    <div>
      <Sidebar />
      {children}
    </div>
  );
}
