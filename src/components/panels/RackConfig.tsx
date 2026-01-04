'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { useRackStore } from '@/stores';
import {
  MIN_RACK_SIZE,
  MAX_RACK_SIZE,
  MIN_DEPTH_INCHES,
  MAX_DEPTH_INCHES,
  INCH_TO_MM,
} from '@/constants';

export function RackConfig() {
  const rackSize = useRackStore((state) => state.rack.config.size);
  const rackDepthMm = useRackStore((state) => state.rack.config.depth);
  const rackName = useRackStore((state) => state.rack.config.name);
  const setRackSize = useRackStore((state) => state.setRackSize);
  const setRackDepth = useRackStore((state) => state.setRackDepth);
  const equipmentCount = useRackStore((state) => state.equipment.length);

  // Convert depth from mm to inches for display
  const rackDepthInches = Math.round(rackDepthMm / INCH_TO_MM);

  const handleSizeSliderChange = (value: number[]) => {
    setRackSize(value[0]);
  };

  const handleSizeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value)) {
      setRackSize(value);
    }
  };

  const handleDepthSliderChange = (value: number[]) => {
    setRackDepth(value[0]);
  };

  const handleDepthInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value)) {
      setRackDepth(value);
    }
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
          <label className="text-xs text-muted-foreground">Rack Height</label>
          <div className="flex items-center gap-2">
            <Slider
              value={[rackSize]}
              onValueChange={handleSizeSliderChange}
              min={MIN_RACK_SIZE}
              max={MAX_RACK_SIZE}
              step={1}
              className="flex-1"
            />
            <div className="flex items-center gap-1">
              <Input
                type="number"
                value={rackSize}
                onChange={handleSizeInputChange}
                min={MIN_RACK_SIZE}
                max={MAX_RACK_SIZE}
                className="w-16 h-8 text-center"
              />
              <span className="text-xs text-muted-foreground">U</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs text-muted-foreground">Rack Depth</label>
          <div className="flex items-center gap-2">
            <Slider
              value={[rackDepthInches]}
              onValueChange={handleDepthSliderChange}
              min={MIN_DEPTH_INCHES}
              max={MAX_DEPTH_INCHES}
              step={1}
              className="flex-1"
            />
            <div className="flex items-center gap-1">
              <Input
                type="number"
                value={rackDepthInches}
                onChange={handleDepthInputChange}
                min={MIN_DEPTH_INCHES}
                max={MAX_DEPTH_INCHES}
                className="w-16 h-8 text-center"
              />
              <span className="text-xs text-muted-foreground">"</span>
            </div>
          </div>
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
