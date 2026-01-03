'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RackConfig } from '@/components/panels/RackConfig';
import { EquipmentCatalog } from '@/components/panels/EquipmentCatalog';
import { PropertiesPanel } from '@/components/panels/PropertiesPanel';
import { ConnectionsPanel } from '@/components/panels/ConnectionsPanel';

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
          <EquipmentCatalog />
        </TabsContent>

        <TabsContent value="properties" className="mt-4">
          <PropertiesPanel />
        </TabsContent>

        <TabsContent value="connections" className="mt-4">
          <ConnectionsPanel />
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
