import { ReactNode } from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Aplicaciones',
  description: 'Aplicaciones Xura',
};

export default function AplicacionesLayout({ children }: { children: ReactNode }) {
  return (
    <div>
      {children}
    </div>
  );
}
