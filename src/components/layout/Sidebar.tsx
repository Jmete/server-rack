'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RackConfig } from '@/components/panels/RackConfig';

export function Sidebar() {
  return (
    <div className="h-full p-4 bg-background overflow-y-auto">
      <div className="mb-4">
        <h1 className="text-xl font-semibold">Rack Configurator</h1>
        <p className="text-sm text-muted-foreground">3D Server Rack Designer</p>
      </div>

      {/* Rack Configuration */}
      <div className="mb-4">
        <RackConfig />
      </div>

      <Tabs defaultValue="catalog" className="w-full">
        <TabsList className="w-full grid grid-cols-4">
          <TabsTrigger value="catalog">Catalog</TabsTrigger>
          <TabsTrigger value="properties">Properties</TabsTrigger>
          <TabsTrigger value="connections">Cables</TabsTrigger>
          <TabsTrigger value="export">Export</TabsTrigger>
        </TabsList>

        <TabsContent value="catalog" className="mt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Equipment Catalog</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Drag equipment from here to the rack.
              </p>
              <div className="mt-4 space-y-2">
                <div className="p-3 border border-border rounded-md bg-muted/50 cursor-pointer hover:bg-muted transition-colors">
                  <div className="font-medium text-sm">UDM Pro Router</div>
                  <div className="text-xs text-muted-foreground">1U - 8x RJ45, 2x SFP+</div>
                </div>
                <div className="p-3 border border-border rounded-md bg-muted/50 cursor-pointer hover:bg-muted transition-colors">
                  <div className="font-medium text-sm">USW Pro 48 PoE</div>
                  <div className="text-xs text-muted-foreground">1U - 48x RJ45, 4x SFP+</div>
                </div>
                <div className="p-3 border border-border rounded-md bg-muted/50 cursor-pointer hover:bg-muted transition-colors">
                  <div className="font-medium text-sm">24-Port Patch Panel</div>
                  <div className="text-xs text-muted-foreground">1U - 24x RJ45</div>
                </div>
                <div className="p-3 border border-border rounded-md bg-muted/50 cursor-pointer hover:bg-muted transition-colors">
                  <div className="font-medium text-sm">Rack UPS</div>
                  <div className="text-xs text-muted-foreground">2U - LCD Display, 6x Outlets</div>
                </div>
                <div className="p-3 border border-border rounded-md bg-muted/50 cursor-pointer hover:bg-muted transition-colors">
                  <div className="font-medium text-sm">UK PDU</div>
                  <div className="text-xs text-muted-foreground">1U - 8x BS1363 Outlets</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="properties" className="mt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Properties</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Select an item to view its properties.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="connections" className="mt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Cable Connections</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Manage cable connections between ports.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="export" className="mt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Export Options</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Export your rack configuration.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
