import React from 'react';
import { Metadata } from 'next';
import { Sidebar } from '@/app/shared/layout';

export const metadata: Metadata = {
  title: 'Grupos',
  description: 'Grupos Xura',
};

export default function GruposLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <Sidebar />
      {children}
    </div>
  );
}
