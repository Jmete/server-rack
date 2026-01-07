'use client';

import { MobileSheet } from './MobileSheet';
import { useUIStore } from '@/stores';
import { RackSummary } from '@/components/panels/RackSummary';
import { PropertiesPanel } from '@/components/panels/PropertiesPanel';

export function MobilePropertiesSheet() {
  const activePanel = useUIStore((state) => state.activePanel);
  const setActivePanel = useUIStore((state) => state.setActivePanel);
  const selectedEquipmentId = useUIStore((state) => state.selectedEquipmentId);
  const selectedCableId = useUIStore((state) => state.selectedCableId);

  const hasSelection = selectedEquipmentId !== null || selectedCableId !== null;
  const title = hasSelection ? 'Properties' : 'Rack Summary';

  return (
    <MobileSheet
      open={activePanel === 'properties'}
      onOpenChange={(open) => setActivePanel(open ? 'properties' : 'none')}
      title={title}
    >
      <div className="h-full overflow-y-auto">
        {hasSelection ? <PropertiesPanel /> : <RackSummary />}
      </div>
    </MobileSheet>
  );
}
