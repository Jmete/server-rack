'use client';

import { AppLayout, Viewport, Sidebar } from '@/components/layout';
import { DndProvider } from '@/components/dnd/DndProvider';

export default function Home() {
  return (
    <DndProvider>
      <AppLayout
        viewport={<Viewport />}
        sidebar={<Sidebar />}
      />
    </DndProvider>
  );
}
