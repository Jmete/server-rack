'use client';

import { useRackStore } from '@/stores';
import { useShelfStore } from '@/stores/useShelfStore';
import { EquipmentLabelOverlay } from './EquipmentLabelOverlay';
import { ShelfItemLabelOverlay } from './ShelfItemLabelOverlay';

export function LabelOverlayManager() {
  const equipment = useRackStore((state) => state.equipment);
  const shelfItemsMap = useShelfStore((state) => state.shelfItems);

  // Get all shelf equipment (to render shelf item labels)
  const shelfEquipment = equipment.filter((eq) => eq.type === 'shelf');

  // Get non-shelf equipment (shelves don't need overlays)
  const mainEquipment = equipment.filter((eq) => eq.type !== 'shelf');

  return (
    <>
      {/* Equipment labels (excluding shelves) */}
      {mainEquipment.map((eq) => (
        <EquipmentLabelOverlay key={eq.instanceId} equipment={eq} />
      ))}

      {/* Shelf item labels */}
      {shelfEquipment.map((shelf) => {
        const items = shelfItemsMap[shelf.instanceId] || [];
        return items.map((item) => (
          <ShelfItemLabelOverlay
            key={item.instanceId}
            item={item}
            parentShelf={shelf}
          />
        ));
      })}
    </>
  );
}
