'use client';

import { AppLayout, Viewport, Header, LeftPanel, RightPanel } from '@/components/layout';
import { DndProvider } from '@/components/dnd/DndProvider';
import { RackSettingsModal } from '@/components/modals/RackSettingsModal';
import { ExportModal } from '@/components/modals/ExportModal';

export default function Home() {
  return (
    <DndProvider>
      <AppLayout
        header={<Header />}
        leftPanel={<LeftPanel />}
        viewport={<Viewport />}
        rightPanel={<RightPanel />}
      />
      <RackSettingsModal />
      <ExportModal />
    </DndProvider>
  );
}
