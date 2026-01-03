# 3D Server Rack Configurator - Implementation Plan

## Project Overview
A web-based 3D Server Rack Configurator with drag-and-drop equipment placement, port-to-port cable connections with realistic catenary physics, and export capabilities.

## Technology Stack
| Category | Technology |
|----------|------------|
| Framework | Next.js (latest, App Router) |
| 3D Rendering | @react-three/fiber, @react-three/drei |
| UI Components | shadcn/ui |
| State Management | Zustand |
| Drag & Drop | @dnd-kit/core |
| Cable Physics | Custom catenary math |
| Export | html2canvas, jsPDF |

## User Choices
- **Save/Load**: Export/Import JSON files
- **Cables**: Realistic catenary curves with gravity simulation
- **Detail level**: Medium (clear ports, LEDs, displays)
- **Exports**: Both visual (PDF/PNG) and port mapping CSV reports

---

## Project Structure

```
server-rack/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                     # Shadcn components
│   │   ├── layout/
│   │   │   ├── AppLayout.tsx
│   │   │   ├── Viewport.tsx
│   │   │   └── Sidebar.tsx
│   │   ├── three/
│   │   │   ├── Scene.tsx
│   │   │   ├── Rack.tsx
│   │   │   ├── RackSlot.tsx
│   │   │   ├── Equipment.tsx
│   │   │   ├── equipment/
│   │   │   │   ├── UDMProRouter.tsx
│   │   │   │   ├── USWProSwitch.tsx
│   │   │   │   ├── PatchPanel.tsx
│   │   │   │   ├── RackUPS.tsx
│   │   │   │   └── PDU.tsx
│   │   │   ├── ports/
│   │   │   │   ├── Port.tsx
│   │   │   │   ├── RJ45Port.tsx
│   │   │   │   ├── SFPPort.tsx
│   │   │   │   ├── PowerPort.tsx
│   │   │   │   └── UKOutlet.tsx
│   │   │   ├── cables/
│   │   │   │   ├── Cable.tsx
│   │   │   │   └── CableManager.tsx
│   │   │   └── controls/
│   │   │       └── CameraControls.tsx
│   │   ├── panels/
│   │   │   ├── EquipmentCatalog.tsx
│   │   │   ├── PropertiesPanel.tsx
│   │   │   ├── ConnectionsPanel.tsx
│   │   │   └── ExportPanel.tsx
│   │   └── dnd/
│   │       ├── DndProvider.tsx
│   │       └── DraggableEquipment.tsx
│   ├── stores/
│   │   ├── useRackStore.ts
│   │   ├── useConnectionStore.ts
│   │   └── useUIStore.ts
│   ├── types/
│   │   ├── rack.ts
│   │   ├── equipment.ts
│   │   ├── port.ts
│   │   ├── cable.ts
│   │   └── index.ts
│   ├── lib/
│   │   ├── utils.ts
│   │   ├── catenary.ts
│   │   ├── export.ts
│   │   └── equipment-catalog.ts
│   ├── hooks/
│   │   ├── useEquipmentDrag.ts
│   │   ├── usePortConnection.ts
│   │   └── useExport.ts
│   └── constants/
│       ├── rack.ts
│       ├── equipment.ts
│       └── colors.ts
├── components.json
├── tailwind.config.ts
└── package.json
```

---

## Equipment Specifications (Ubiquiti-based)

### UDM-Pro Router (1U)
- **Dimensions**: 442.4mm x 285.6mm x 43.7mm
- **Ports**: 8x RJ45 LAN (1G), 1x RJ45 WAN (1G), 2x SFP+ (10G)
- **Features**: 1.3" color touchscreen display

### USW-Pro-48-POE Switch (1U)
- **Dimensions**: 442.4mm x 399.6mm x 43.7mm
- **Ports**: 48x RJ45 (2 rows, PoE+/PoE++), 4x SFP+ (10G)
- **Features**: 1.3" touchscreen display

### 24-Port Patch Panel (1U)
- **Dimensions**: 442.4mm x 50mm x ~44mm
- **Ports**: 24x RJ45 keystone ports (single row)

### Rack-Mount UPS (2U)
- **Dimensions**: 432mm x 438mm x 86mm
- **Ports**: 6x IEC C13 outputs (rear)
- **Features**: LCD display, status LEDs

### UK PDU (1U)
- **Dimensions**: 483mm x 44.5mm x 44mm
- **Ports**: 8x BS1363 UK outlets
- **Features**: Power switch, power LED

---

## Implementation Sections

### Section 1: Project Setup & Basic 3D Scene
**Status**: [x] Complete

**Goal**: Establish project foundation with working 3D viewport

**Implement**:
- Initialize Next.js project with TypeScript, Tailwind CSS
- Install: @react-three/fiber, @react-three/drei, zustand, shadcn/ui
- Create AppLayout with 70/30 split panels
- Basic Canvas with grid floor and orbit controls
- Lighting setup (ambient + directional)

**Files**:
- `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`
- `src/components/layout/AppLayout.tsx`, `Viewport.tsx`, `Sidebar.tsx`
- `src/components/three/Scene.tsx`
- `src/components/three/controls/CameraControls.tsx`

**Test Criteria**:
- [x] App loads without errors at localhost:3001
- [x] Split layout visible: 3D viewport (left), sidebar placeholder (right)
- [x] 3D grid floor visible
- [x] Can pan, zoom, rotate camera with mouse
- [x] Clean minimalist appearance

---

### Section 2: Type Definitions & State Management
**Status**: [x] Complete

**Goal**: Define data structures and set up state stores

**Implement**:
- All TypeScript interfaces (Rack, Equipment, Port, Cable)
- Zustand stores (useRackStore, useConnectionStore, useUIStore)
- Constants for rack dimensions
- Equipment catalog data structure

**Files**:
- `src/types/*.ts`
- `src/stores/*.ts`
- `src/constants/*.ts`
- `src/lib/equipment-catalog.ts`

**Test Criteria**:
- [x] TypeScript compiles without errors
- [x] Can log store state in console
- [x] Default rack config initializes (42U, 19")

---

### Section 3: 3D Rack Model
**Status**: [x] Complete

**Goal**: Render configurable rack frame with U slots

**Implement**:
- 3D rack frame (19" standard, dark metal finish)
- Configurable height (42U/48U selector in sidebar)
- Visual U slot indicators with numbering
- Rack rails on left and right sides

**Files**:
- `src/components/three/Rack.tsx`
- `src/components/three/RackSlot.tsx`
- `src/components/panels/RackConfig.tsx`

**Test Criteria**:
- [x] 3D rack displays with correct proportions
- [x] U positions numbered 1-42 (or 1-48)
- [x] Dropdown in sidebar changes rack size
- [x] Rack re-renders with new U count
- [x] Professional dark metal appearance

---

### Section 4: First Equipment Model (UDM-Pro Router)
**Status**: [x] Complete

**Goal**: Create first equipment with ports

**Implement**:
- Base Equipment component
- UDM-Pro Router 3D model (1U)
- Port components (RJ45Port, SFPPort)
- Equipment factory pattern
- Test equipment placement at U position 1

**Files**:
- `src/components/three/Equipment.tsx`
- `src/components/three/equipment/UDMProRouter.tsx`
- `src/components/three/ports/Port.tsx`
- `src/components/three/ports/RJ45Port.tsx`
- `src/components/three/ports/SFPPort.tsx`

**Test Criteria**:
- [x] UDM-Pro renders in rack at position U1
- [x] Display area visible on front panel
- [x] 8 RJ45 LAN ports visible and distinguishable
- [x] 1 RJ45 WAN port visible (different color indicator)
- [x] 2 SFP+ ports visible (different shape)
- [x] Ports change color on hover

---

### Section 5: Remaining Equipment Models
**Status**: [ ] Not Started

**Goal**: Complete all 5 equipment types

**Implement**:
- USW-Pro-48-POE Switch (1U, 48 ports in 2 rows + 4 SFP+)
- 24-Port Patch Panel (1U, 24 RJ45 ports)
- Rack-Mount UPS (2U, LCD display, status LEDs)
- UK PDU (1U, 8x BS1363 UK outlets)
- PowerPort and UKOutlet components

**Files**:
- `src/components/three/equipment/USWProSwitch.tsx`
- `src/components/three/equipment/PatchPanel.tsx`
- `src/components/three/equipment/RackUPS.tsx`
- `src/components/three/equipment/PDU.tsx`
- `src/components/three/ports/PowerPort.tsx`
- `src/components/three/ports/UKOutlet.tsx`

**Test Criteria**:
- [ ] All 5 equipment types render correctly
- [ ] Switch shows 48 ports in 2 rows of 24
- [ ] UPS spans 2U height correctly
- [ ] PDU shows UK-style rectangular outlets
- [ ] Port types visually distinct (RJ45 vs SFP+ vs UK outlet)
- [ ] Each equipment has correct port count

---

### Section 6: Equipment Catalog & Drag-and-Drop
**Status**: [ ] Not Started

**Goal**: Drag equipment from sidebar to rack

**Implement**:
- Equipment catalog panel with thumbnails/icons
- @dnd-kit integration
- Draggable catalog items
- Drop zone detection on rack slots
- Snap-to-U positioning
- Collision detection (no overlapping equipment)
- Remove equipment button

**Files**:
- `src/components/dnd/DndProvider.tsx`
- `src/components/dnd/DraggableEquipment.tsx`
- `src/components/panels/EquipmentCatalog.tsx`
- `src/hooks/useEquipmentDrag.ts`

**Test Criteria**:
- [ ] Catalog shows all 5 equipment types with labels
- [ ] Can drag equipment from catalog
- [ ] Visual feedback during drag (ghost/preview)
- [ ] Equipment snaps to valid U position on drop
- [ ] Cannot drop on occupied slots
- [ ] 2U equipment (UPS) blocks 2 slots
- [ ] Can delete equipment from rack

---

### Section 7: Properties Panel & Equipment Selection
**Status**: [ ] Not Started

**Goal**: View and edit selected equipment

**Implement**:
- Click-to-select equipment in 3D view
- Visual selection indicator (outline glow)
- Properties panel showing equipment details
- Edit custom label
- View port list with types/speeds

**Files**:
- `src/components/panels/PropertiesPanel.tsx`
- Shadcn components: Card, Input, Label, Tabs

**Test Criteria**:
- [ ] Clicking equipment selects it
- [ ] Selected equipment has visual highlight
- [ ] Properties panel shows: name, model, U position
- [ ] Can edit custom label
- [ ] Port list shows all ports with types
- [ ] Clicking empty space deselects

---

### Section 8: Port-to-Port Connections (Basic Cables)
**Status**: [ ] Not Started

**Goal**: Connect ports with cables

**Implement**:
- Connection mode toggle
- Cable type selector (Ethernet Cat6, Fiber, Power)
- Cable color picker
- Port click handling (source -> target)
- Connection validation (compatible ports only)
- Cable rendering (straight lines initially)
- Connections panel listing all cables

**Files**:
- `src/components/three/cables/Cable.tsx`
- `src/components/three/cables/CableManager.tsx`
- `src/components/panels/ConnectionsPanel.tsx`
- `src/hooks/usePortConnection.ts`

**Test Criteria**:
- [ ] "Connect" button activates connection mode
- [ ] First port click highlights as source
- [ ] Second port click creates cable
- [ ] RJ45<->RJ45 allowed, RJ45<->SFP+ rejected
- [ ] Cable color selectable (blue, yellow, red, green, orange, white)
- [ ] Cables visible between ports
- [ ] Connections listed in panel
- [ ] Can delete connections

---

### Section 9: Realistic Cable Physics (Catenary)
**Status**: [ ] Not Started

**Goal**: Cables drape realistically

**Implement**:
- Catenary curve calculation (y = a * cosh(x/a))
- Tube geometry along curve
- Tension parameter (affects droop)
- Basic cable routing (avoid equipment faces)
- Smooth curve rendering (32+ segments)

**Files**:
- `src/lib/catenary.ts`
- Update `src/components/three/cables/Cable.tsx`

**Test Criteria**:
- [ ] Cables sag naturally in the middle
- [ ] Longer cables droop more
- [ ] Cables render as smooth tubes (not jagged)
- [ ] Performance acceptable with 10+ cables
- [ ] Cables don't pass through equipment front

---

### Section 10: Export Functionality
**Status**: [ ] Not Started

**Goal**: Export rack configuration

**Implement**:
- JSON export/import (full rack config)
- PNG screenshot export
- PDF document with rack diagram
- CSV port mapping report
- Export panel UI with buttons

**Files**:
- `src/lib/export.ts`
- `src/components/panels/ExportPanel.tsx`
- `src/hooks/useExport.ts`

**Test Criteria**:
- [ ] "Export JSON" downloads .json file
- [ ] "Import JSON" restores rack state
- [ ] "Export PNG" captures 3D view as image
- [ ] "Export PDF" generates document with diagram
- [ ] "Export CSV" lists all connections with port details
- [ ] Imported config matches exported config

---

## Key Data Models

```typescript
// Rack
interface Rack {
  id: string;
  name: string;
  size: 42 | 48;
  width: 19;
  equipment: Equipment[];
}

// Equipment
interface Equipment {
  instanceId: string;
  type: 'router' | 'switch' | 'patch-panel' | 'ups' | 'pdu';
  name: string;
  model: string;
  heightU: number;
  slotPosition: number;
  ports: Port[];
  customLabel?: string;
}

// Port
interface Port {
  id: string;
  type: 'rj45-lan' | 'rj45-wan' | 'sfp-plus' | 'power-iec' | 'uk-outlet';
  label: string;
  speed?: '1G' | '10G' | 'power';
  connectedTo: string | null;
}

// Cable
interface Cable {
  id: string;
  type: 'ethernet-cat6' | 'fiber-lc' | 'power-iec';
  color: string;
  sourcePortId: string;
  targetPortId: string;
}
```

---

## Dependencies

```json
{
  "dependencies": {
    "next": "^15.1.0",
    "react": "^19.0.0",
    "@react-three/fiber": "^9.0.0",
    "@react-three/drei": "^10.0.0",
    "three": "^0.170.0",
    "zustand": "^5.0.0",
    "@dnd-kit/core": "^6.3.0",
    "jspdf": "^2.5.0",
    "html2canvas": "^1.4.0",
    "lucide-react": "^0.469.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.6.0"
  }
}
```

---

## Critical Files (Priority Order)
1. `src/stores/useRackStore.ts` - Central state for all rack data
2. `src/components/three/Rack.tsx` - 3D rack rendering
3. `src/components/three/Equipment.tsx` - Equipment factory
4. `src/lib/catenary.ts` - Cable physics math
5. `src/hooks/usePortConnection.ts` - Connection logic

---

## Progress Log

| Date | Section | Status | Notes |
|------|---------|--------|-------|
| 2026-01-03 | Section 1 | Complete | Next.js + R3F + shadcn setup, 70/30 layout, 3D scene with grid |
| 2026-01-03 | Section 2 | Complete | Types, Zustand stores, constants, equipment catalog |
| 2026-01-03 | Section 3 | Complete | 3D rack frame with U slots, size selector, dark metal appearance |
| 2026-01-03 | Section 4 | Complete | UDM-Pro model, RJ45/SFP+ ports, equipment catalog with click-to-add |
