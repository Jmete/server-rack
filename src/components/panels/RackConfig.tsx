'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useRackStore } from '@/stores';
import { RackSize } from '@/types';

export function RackConfig() {
  const rackSize = useRackStore((state) => state.rack.config.size);
  const rackName = useRackStore((state) => state.rack.config.name);
  const setRackSize = useRackStore((state) => state.setRackSize);
  const equipmentCount = useRackStore((state) => state.equipment.length);

  const handleSizeChange = (value: string) => {
    const newSize = parseInt(value, 10) as RackSize;
    setRackSize(newSize);
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Rack Configuration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground">Rack Name</label>
          <div className="text-sm font-medium">{rackName}</div>
        </div>

        <div className="space-y-2">
          <label className="text-xs text-muted-foreground">Rack Size</label>
          <Select value={rackSize.toString()} onValueChange={handleSizeChange}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="42">42U (Standard)</SelectItem>
              <SelectItem value="48">48U (Extended)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-xs text-muted-foreground">Width</label>
          <div className="text-sm font-medium">19" (Standard)</div>
        </div>

        <div className="pt-2 border-t border-border">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Equipment</span>
            <span className="font-medium">{equipmentCount} items</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
