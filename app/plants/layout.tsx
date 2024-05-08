'use client';
import LayoutWithHeader from '@/components/template/LayoutWithHeader';
import { ReactNode } from 'react';

type Props = {
  readonly children: ReactNode;
};

export default function Layout({ children }: Props) {
  return (
    <LayoutWithHeader>{children}</LayoutWithHeader>
  );
}
