'use client';

import { AppLayout, Viewport, Sidebar } from '@/components/layout';

export default function Home() {
  return (
    <AppLayout
      viewport={<Viewport />}
      sidebar={<Sidebar />}
    />
  );
}
