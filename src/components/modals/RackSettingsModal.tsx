'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { useRackStore, useUIStore } from '@/stores';
import {
  MIN_RACK_SIZE,
  MAX_RACK_SIZE,
  MIN_DEPTH_INCHES,
  MAX_DEPTH_INCHES,
  INCH_TO_MM,
} from '@/constants';

export function RackSettingsModal() {
  const rackSize = useRackStore((state) => state.rack.config.size);
  const rackDepthMm = useRackStore((state) => state.rack.config.depth);
  const rackName = useRackStore((state) => state.rack.config.name);
  const setRackSize = useRackStore((state) => state.setRackSize);
  const setRackDepth = useRackStore((state) => state.setRackDepth);
  const setRackName = useRackStore((state) => state.setRackName);

  const isOpen = useUIStore((state) => state.rackSettingsModalOpen);
  const setOpen = useUIStore((state) => state.setRackSettingsModalOpen);

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

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRackName(e.target.value);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Rack Settings</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Rack Name */}
          <div className="space-y-2">
            <Label htmlFor="rackName" className="text-sm">
              Rack Name
            </Label>
            <Input
              id="rackName"
              type="text"
              value={rackName}
              onChange={handleNameChange}
              placeholder="Enter rack name"
            />
          </div>

          {/* Rack Height */}
          <div className="space-y-2">
            <Label className="text-sm">Rack Height</Label>
            <div className="flex items-center gap-3">
              <Slider
                value={[rackSize]}
                onValueChange={handleSizeSliderChange}
                min={MIN_RACK_SIZE}
                max={MAX_RACK_SIZE}
                step={1}
                className="flex-1"
              />
              <div className="flex items-center gap-1.5">
                <Input
                  type="number"
                  value={rackSize}
                  onChange={handleSizeInputChange}
                  min={MIN_RACK_SIZE}
                  max={MAX_RACK_SIZE}
                  className="w-16 h-9 text-center"
                />
                <span className="text-sm text-muted-foreground">U</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Standard racks range from {MIN_RACK_SIZE}U to {MAX_RACK_SIZE}U
            </p>
          </div>

          {/* Rack Depth */}
          <div className="space-y-2">
            <Label className="text-sm">Rack Depth</Label>
            <div className="flex items-center gap-3">
              <Slider
                value={[rackDepthInches]}
                onValueChange={handleDepthSliderChange}
                min={MIN_DEPTH_INCHES}
                max={MAX_DEPTH_INCHES}
                step={1}
                className="flex-1"
              />
              <div className="flex items-center gap-1.5">
                <Input
                  type="number"
                  value={rackDepthInches}
                  onChange={handleDepthInputChange}
                  min={MIN_DEPTH_INCHES}
                  max={MAX_DEPTH_INCHES}
                  className="w-16 h-9 text-center"
                />
                <span className="text-sm text-muted-foreground">"</span>
              </div>
            </div>
          </div>

          {/* Width (read-only) */}
          <div className="space-y-2">
            <Label className="text-sm">Width</Label>
            <div className="text-sm font-medium px-3 py-2 bg-muted rounded-md">
              19" (Standard)
            </div>
            <p className="text-xs text-muted-foreground">
              Industry standard 19-inch rack width
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
