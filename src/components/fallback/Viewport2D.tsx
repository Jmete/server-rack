'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { useConnectionStore, usePortStore, useRackStore, useUIStore } from '@/stores';
import { useShelfStore } from '@/stores/useShelfStore';
import { FRAME_THICKNESS_MM, RACK_CONSTANTS, UI_COLORS, mmToScene } from '@/constants';
import { PORT_TYPE_COLORS } from '@/types/port';
import { CABLE_PORT_COMPATIBILITY, resolveCableType } from '@/types/cable';
import { getRotatedDimensions } from '@/types/shelf';

interface Viewport2DProps {
  isDarkBackground: boolean;
  showLabelOverlays: boolean;
  children?: ReactNode;
}

interface RackLayout {
  left: number;
  top: number;
  width: number;
  height: number;
  slotHeightPx: number;
  scale: number;
}

interface LayoutState {
  containerWidth: number;
  containerHeight: number;
  gap: number;
  contentLeft: number;
  contentTop: number;
  contentWidth: number;
  contentHeight: number;
  front: RackLayout;
  back: RackLayout;
}

type PortLayout = {
  id: string;
  equipmentInstanceId: string;
  side: 'front' | 'back';
  localX: number;
  localY: number;
  screenX: number;
  screenY: number;
};

const RACK_WIDTH_MM = RACK_CONSTANTS.STANDARD_WIDTH_MM;
const U_HEIGHT_MM = RACK_CONSTANTS.U_HEIGHT_MM;
const SHELF_RAIL_MARGIN_MM = 20;
const SHELF_FRONT_MARGIN_MM = 10;
const SHELF_DEPTH_CLEARANCE_MM = 50;

type ShelfPlan = {
  shelfId: string;
  top: number;
  left: number;
  width: number;
  height: number;
  planLeft: number;
  planTop: number;
  planWidth: number;
  planHeight: number;
  usableWidthMm: number;
  usableDepthMm: number;
  scaleX: number;
  scaleZ: number;
};

type ShelfPlanSet = {
  front: ShelfPlan;
  back: ShelfPlan;
};

export function Viewport2D({ isDarkBackground, showLabelOverlays, children }: Viewport2DProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const panGestureRef = useRef(false);
  const isPanningRef = useRef(false);
  const lastPointerRef = useRef({ x: 0, y: 0 });

  const isInteractiveTarget = (target: EventTarget | null) => {
    if (!(target instanceof Element)) return false;
    return target.closest('[data-viewport-interactive="true"]') !== null;
  };

  const rackSize = useRackStore((state) => state.rack.config.size);
  const rackDepthMm = useRackStore((state) => state.rack.config.depth);
  const equipment = useRackStore((state) => state.equipment);
  const shelfItemsMap = useShelfStore((state) => state.shelfItems);
  const selectedEquipmentId = useUIStore((state) => state.selectedEquipmentId);
  const selectedCableId = useUIStore((state) => state.selectedCableId);
  const hoveredPortId = useUIStore((state) => state.hoveredPortId);
  const isDragging = useUIStore((state) => state.isDragging);
  const rackHover = useUIStore((state) => state.rackHover);
  const isExporting = useUIStore((state) => state.isExporting);
  const clearSelection = useUIStore((state) => state.clearSelection);
  const selectEquipment = useUIStore((state) => state.selectEquipment);
  const selectPort = useUIStore((state) => state.selectPort);
  const selectCable = useUIStore((state) => state.selectCable);
  const setHoveredPort = useUIStore((state) => state.setHoveredPort);
  const setRackScreenBounds = useUIStore((state) => state.setRackScreenBounds);
  const setRackSlotBounds = useUIStore((state) => state.setRackSlotBounds);
  const setEquipmentScreenBounds = useUIStore((state) => state.setEquipmentScreenBounds);
  const setPortScreenPositions = useUIStore((state) => state.setPortScreenPositions);
  const setExportCameraReady = useUIStore((state) => state.setExportCameraReady);

  const connectionMode = useConnectionStore((state) => state.connectionMode);
  const cables = useConnectionStore((state) => state.cables);
  const startConnection = useConnectionStore((state) => state.startConnection);
  const completeConnection = useConnectionStore((state) => state.completeConnection);
  const setCableType = useConnectionStore((state) => state.setCableType);
  const connectionActive = connectionMode.active;

  const registerPort = usePortStore((state) => state.registerPort);
  const unregisterPort = usePortStore((state) => state.unregisterPort);
  const setPortPosition = usePortStore((state) => state.setPortPosition);
  const portTypes = usePortStore((state) => state.types);

  const getShelfPortCoords = (
    item: { width: number; depth: number; position: { x: number; z: number; rotation: number } },
    port: { position: { x: number; z: number } }
  ) => {
    const rotated = getRotatedDimensions(item.width, item.depth, item.position.rotation);
    const itemCenterX = item.position.x + rotated.width / 2;
    const itemCenterZ = item.position.z + rotated.depth / 2;
    const isBackFace = port.position.z >= item.depth;
    const portXmm = isBackFace ? item.width - port.position.x : port.position.x;
    const portZmm = Math.min(item.depth, Math.max(0, port.position.z));
    const localX = portXmm - item.width / 2;
    const localZ = portZmm - item.depth / 2;
    const theta = (item.position.rotation * Math.PI) / 180;
    const rotX = localX * Math.cos(theta) + localZ * Math.sin(theta);
    const rotZ = -localX * Math.sin(theta) + localZ * Math.cos(theta);

    return {
      x: itemCenterX + rotX,
      z: itemCenterZ + rotZ,
      isBackFace,
    };
  };

  const layout = useMemo<LayoutState | null>(() => {
    const { width: containerWidth, height: containerHeight } = containerSize;
    if (containerWidth <= 0 || containerHeight <= 0) {
      return null;
    }

    const rackHeightMm = rackSize * U_HEIGHT_MM;
    const gap = Math.max(24, Math.min(80, containerWidth * 0.08));
    const maxWidthPerRack = Math.max(1, (containerWidth - gap) / 2);
    const baseScale = Math.min(
      maxWidthPerRack / RACK_WIDTH_MM,
      (containerHeight * 0.9) / rackHeightMm
    );
    const scale = baseScale * zoom;

    const rackWidthPx = Math.max(1, RACK_WIDTH_MM * scale);
    const rackHeightPx = Math.max(1, rackHeightMm * scale);
    const contentWidth = rackWidthPx * 2 + gap;
    const contentHeight = rackHeightPx;
    const contentLeft = (containerWidth - contentWidth) / 2 + pan.x;
    const contentTop = (containerHeight - contentHeight) / 2 + pan.y;
    const slotHeightPx = rackHeightPx / rackSize;
    const rackTop = contentTop;
    const frontLeft = contentLeft;
    const backLeft = contentLeft + rackWidthPx + gap;

    return {
      containerWidth,
      containerHeight,
      gap,
      contentLeft,
      contentTop,
      contentWidth,
      contentHeight,
      front: {
        left: frontLeft,
        top: rackTop,
        width: rackWidthPx,
        height: rackHeightPx,
        slotHeightPx,
        scale,
      },
      back: {
        left: backLeft,
        top: rackTop,
        width: rackWidthPx,
        height: rackHeightPx,
        slotHeightPx,
        scale,
      },
    };
  }, [containerSize, pan.x, pan.y, rackSize, zoom]);

  const shelfPlans = useMemo(() => {
    if (!layout) return new Map<string, ShelfPlanSet>();
    const plans = new Map<string, ShelfPlanSet>();
    const slotHeight = layout.front.slotHeightPx;

    equipment.forEach((eq) => {
      if (eq.type !== 'shelf') return;

      const shelfHeightPx = eq.heightU * slotHeight;
      const shelfTop = layout.front.top + (layout.front.height - (eq.slotPosition - 1 + eq.heightU) * slotHeight);
      const usableWidthMm = Math.max(1, eq.width - SHELF_RAIL_MARGIN_MM * 2);
      const shelfDepthMm = Math.max(1, Math.min(eq.depth, rackDepthMm - SHELF_DEPTH_CLEARANCE_MM));
      const usableDepthMm = Math.max(
        1,
        Math.min(eq.depth - SHELF_FRONT_MARGIN_MM, shelfDepthMm - SHELF_FRONT_MARGIN_MM)
      );
      const planPaddingX = Math.max(3, Math.min(10, shelfHeightPx * 0.3));
      const planPaddingY = Math.max(2, Math.min(8, shelfHeightPx * 0.25));

      const buildPlan = (rack: RackLayout): ShelfPlan => {
        const planWidth = Math.max(1, rack.width - planPaddingX * 2);
        const planHeight = Math.max(1, shelfHeightPx - planPaddingY * 2);
        const planLeft = rack.left + planPaddingX;
        const planTop = shelfTop + planPaddingY;
        return {
          shelfId: eq.instanceId,
          top: shelfTop,
          left: rack.left,
          width: rack.width,
          height: shelfHeightPx,
          planLeft,
          planTop,
          planWidth,
          planHeight,
          usableWidthMm,
          usableDepthMm,
          scaleX: planWidth / usableWidthMm,
          scaleZ: planHeight / usableDepthMm,
        };
      };

      plans.set(eq.instanceId, {
        front: buildPlan(layout.front),
        back: buildPlan(layout.back),
      });
    });

    return plans;
  }, [equipment, layout, rackDepthMm]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const { width, height } = entry.contentRect;
      setContainerSize({ width, height });
    });
    observer.observe(container);
    const rect = container.getBoundingClientRect();
    setContainerSize({ width: rect.width, height: rect.height });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (isExporting && layout) {
      setExportCameraReady(true);
    } else {
      setExportCameraReady(false);
    }
  }, [isExporting, layout, setExportCameraReady]);

  useEffect(() => {
    const portIds: string[] = [];
    equipment.forEach((eq) => {
      eq.ports.forEach((port) => {
        const globalId = `${eq.instanceId}-${port.id}`;
        registerPort(globalId, port.type);
        portIds.push(globalId);
      });
    });
    Object.values(shelfItemsMap).forEach((items) => {
      items.forEach((item) => {
        item.ports.forEach((port) => {
          const globalId = `${item.instanceId}-${port.id}`;
          registerPort(globalId, port.type);
          portIds.push(globalId);
        });
      });
    });
    return () => {
      portIds.forEach((id) => unregisterPort(id));
    };
  }, [equipment, registerPort, shelfItemsMap, unregisterPort]);

  const rackHeightMm = useMemo(() => rackSize * U_HEIGHT_MM, [rackSize]);

  const portLayouts = useMemo(() => {
    if (!layout) return [] as PortLayout[];
    const ports: PortLayout[] = [];

    equipment.forEach((eq) => {
      const equipmentOffsetMm = (RACK_WIDTH_MM - eq.width) / 2;
      const equipmentBottomMm = (eq.slotPosition - 1) * U_HEIGHT_MM;

      eq.ports.forEach((port) => {
        const globalId = `${eq.instanceId}-${port.id}`;
        const portXmmRaw = equipmentOffsetMm + port.position.x;
        const isBack = port.position.z >= eq.depth;
        const portXmm = isBack
          ? RACK_WIDTH_MM - portXmmRaw
          : portXmmRaw;
        const clampedXmm = Math.min(RACK_WIDTH_MM, Math.max(0, portXmm));
        const portYmm = Math.min(
          rackHeightMm,
          Math.max(0, equipmentBottomMm + port.position.y)
        );

        const side: 'front' | 'back' = isBack ? 'back' : 'front';
        const rackLayout = side === 'front' ? layout.front : layout.back;
        const localX = (clampedXmm / RACK_WIDTH_MM) * rackLayout.width;
        const localY = (1 - portYmm / rackHeightMm) * rackLayout.height;

        ports.push({
          id: globalId,
          equipmentInstanceId: eq.instanceId,
          side,
          localX,
          localY,
          screenX: rackLayout.left + localX,
          screenY: rackLayout.top + localY,
        });
      });
    });

    equipment.forEach((eq) => {
      if (eq.type !== 'shelf') return;
      const planSet = shelfPlans.get(eq.instanceId);
      if (!planSet) return;
      const items = shelfItemsMap[eq.instanceId] || [];
      items.forEach((item) => {
        item.ports.forEach((port) => {
          const globalId = `${item.instanceId}-${port.id}`;
          const { x, z, isBackFace } = getShelfPortCoords(item, port);
          const side: 'front' | 'back' = isBackFace ? 'back' : 'front';
          const plan = side === 'front' ? planSet.front : planSet.back;
          const shelfX = side === 'back' ? plan.usableWidthMm - x : x;
          const screenX = plan.planLeft + shelfX * plan.scaleX;
          const screenY = plan.planTop + z * plan.scaleZ;
          ports.push({
            id: globalId,
            equipmentInstanceId: item.instanceId,
            side,
            localX: shelfX * plan.scaleX,
            localY: z * plan.scaleZ,
            screenX,
            screenY,
          });
        });
      });
    });

    return ports;
  }, [equipment, getShelfPortCoords, layout, rackHeightMm, shelfItemsMap, shelfPlans]);

  useEffect(() => {
    if (!layout) {
      setRackScreenBounds(null);
      setRackSlotBounds(null);
      setEquipmentScreenBounds(null);
      setPortScreenPositions(null);
      return;
    }

    const rackBounds = {
      left: layout.front.left,
      top: layout.front.top,
      width: layout.front.width,
      height: layout.front.height,
    };

    const slotBounds = Array.from({ length: rackSize }, (_, index) => {
      const slotNumber = index + 1;
      const top = layout.front.top + (layout.front.height - slotNumber * layout.front.slotHeightPx);
      return {
        slotNumber,
        left: layout.front.left,
        top,
        width: layout.front.width,
        height: layout.front.slotHeightPx,
      };
    });

    const equipmentBounds = equipment.map((eq) => {
      const top = layout.front.top + (layout.front.height - (eq.slotPosition - 1 + eq.heightU) * layout.front.slotHeightPx);
      return {
        instanceId: eq.instanceId,
        left: layout.front.left,
        top,
        width: layout.front.width,
        height: eq.heightU * layout.front.slotHeightPx,
      };
    });

    setRackScreenBounds(rackBounds);
    setRackSlotBounds(slotBounds);
    setEquipmentScreenBounds(equipmentBounds);
    setPortScreenPositions(
      portLayouts.map((port) => ({ id: port.id, x: port.screenX, y: port.screenY }))
    );
  }, [
    equipment,
    layout,
    portLayouts,
    rackSize,
    setEquipmentScreenBounds,
    setPortScreenPositions,
    setRackScreenBounds,
    setRackSlotBounds,
  ]);

  useEffect(() => {
    if (!layout) return;
    const railFrontZmm =
      rackDepthMm / 2 - FRAME_THICKNESS_MM / 2 + (FRAME_THICKNESS_MM * 0.8) / 2;

    equipment.forEach((eq) => {
      const equipmentOffsetMm = (RACK_WIDTH_MM - eq.width) / 2;
      const equipmentBottomMm = (eq.slotPosition - 1) * U_HEIGHT_MM;
      const equipmentCenterZmm = railFrontZmm - eq.depth / 2;

      eq.ports.forEach((port) => {
        const globalId = `${eq.instanceId}-${port.id}`;
        const portXmmRaw = equipmentOffsetMm + port.position.x;
        const isBack = port.position.z >= eq.depth;
        const portXmm = Math.min(
          RACK_WIDTH_MM,
          Math.max(0, isBack ? RACK_WIDTH_MM - portXmmRaw : portXmmRaw)
        );
        const portYmm = Math.min(
          rackHeightMm,
          Math.max(0, equipmentBottomMm + port.position.y)
        );
        const portZmm = equipmentCenterZmm + (eq.depth / 2 - port.position.z);

        const sceneX = mmToScene(portXmm - RACK_WIDTH_MM / 2);
        const sceneY = mmToScene(FRAME_THICKNESS_MM + portYmm);
        const sceneZ = mmToScene(portZmm);
        setPortPosition(globalId, [sceneX, sceneY, sceneZ]);
      });
    });

    equipment.forEach((eq) => {
      if (eq.type !== 'shelf') return;
      const items = shelfItemsMap[eq.instanceId] || [];
      if (items.length === 0) return;

      const equipmentOffsetMm = (RACK_WIDTH_MM - eq.width) / 2;
      const shelfFrontZmm = railFrontZmm;
      const shelfUsableStartXmm = equipmentOffsetMm + SHELF_RAIL_MARGIN_MM;
      const shelfUsableStartZmm = shelfFrontZmm - SHELF_FRONT_MARGIN_MM;
      const shelfTopMm = (eq.slotPosition - 1 + eq.heightU) * U_HEIGHT_MM;

      items.forEach((item) => {
        item.ports.forEach((port) => {
          const globalId = `${item.instanceId}-${port.id}`;
          const { x, z } = getShelfPortCoords(item, port);
          const portXmm = shelfUsableStartXmm + x;
          const portZmm = shelfUsableStartZmm - z;
          const portYmm = shelfTopMm + port.position.y;

          const sceneX = mmToScene(portXmm - RACK_WIDTH_MM / 2);
          const sceneY = mmToScene(FRAME_THICKNESS_MM + portYmm);
          const sceneZ = mmToScene(portZmm);
          setPortPosition(globalId, [sceneX, sceneY, sceneZ]);
        });
      });
    });
  }, [equipment, getShelfPortCoords, layout, rackDepthMm, rackHeightMm, setPortPosition, shelfItemsMap]);

  const cablesByPort = useMemo(() => {
    const map = new Map<string, boolean>();
    cables.forEach((cable) => {
      map.set(cable.sourcePortId, true);
      map.set(cable.targetPortId, true);
    });
    return map;
  }, [cables]);

  const portPositionsById = useMemo(() => {
    const map = new Map<string, PortLayout>();
    portLayouts.forEach((port) => {
      map.set(port.id, port);
    });
    return map;
  }, [portLayouts]);

  const renderPortButton = (port: PortLayout) => {
    const globalId = port.id;

    const isSource = connectionMode.sourcePortId === globalId;
    const isHovered = hoveredPortId === globalId;
    const isConnected = cablesByPort.get(globalId) ?? false;

    const sourceType = connectionMode.sourcePortId
      ? portTypes[connectionMode.sourcePortId]
      : undefined;
    const targetType = portTypes[globalId];

    const resolvedCableType = connectionMode.active && connectionMode.sourcePortId
      ? connectionMode.sourcePortId === globalId
        ? connectionMode.cableType
        : sourceType && targetType
        ? resolveCableType(sourceType, targetType, connectionMode.cableType)
        : null
      : null;

    const isCompatible = !connectionMode.active || !connectionMode.sourcePortId
      ? true
      : resolvedCableType !== null;

    let displayColor = targetType ? PORT_TYPE_COLORS[targetType] : '#94a3b8';
    if (isSource) {
      displayColor = UI_COLORS.CONNECTION_SOURCE;
    } else if (isHovered) {
      displayColor = connectionMode.active && !isCompatible ? UI_COLORS.INVALID_DROP : UI_COLORS.HOVER;
    } else if (isConnected) {
      displayColor = UI_COLORS.SELECTION;
    }

    const size = layout ? Math.max(4, Math.min(12, layout.front.slotHeightPx * 0.35)) : 8;

    return (
      <button
        key={globalId}
        type="button"
        className="absolute rounded-sm border border-black/30"
        data-viewport-interactive="true"
        style={{
          left: port.screenX - size / 2,
          top: port.screenY - size / 2,
          width: size,
          height: size,
          backgroundColor: displayColor,
          pointerEvents: 'auto',
          opacity: connectionActive ? 1 : 0.75,
        }}
        onClick={(event) => {
          event.stopPropagation();
          selectEquipment(port.equipmentInstanceId);
          selectPort(globalId);

          if (!connectionMode.active) return;

          if (!connectionMode.sourcePortId) {
            const currentCable = connectionMode.cableType;
            const supportsPort = targetType
              ? CABLE_PORT_COMPATIBILITY[currentCable]?.includes(targetType) ?? false
              : false;

            if (!supportsPort) {
              const portType = targetType;
              if (portType === 'sfp-plus') {
                setCableType('fiber-lc');
              } else if (portType === 'rj45-lan' || portType === 'rj45-wan') {
                setCableType('ethernet-cat6');
              } else if (portType === 'fxo' || portType === 'fxs') {
                setCableType('phone-rj11');
              } else if (portType === 'uk-outlet-bs1363') {
                setCableType('power-uk');
              } else if (portType === 'power-iec-c13' || portType === 'power-iec-c14') {
                setCableType('power-iec');
              }
            }

            if (targetType && targetType !== 'rj45-console') {
              startConnection(globalId);
            }
            return;
          }

          if (connectionMode.sourcePortId === globalId) {
            return;
          }

          if (!isCompatible) {
            return;
          }

          if (resolvedCableType && resolvedCableType !== connectionMode.cableType) {
            setCableType(resolvedCableType);
          }

          completeConnection(globalId);
        }}
        onMouseEnter={() => {
          setHoveredPort(globalId);
          document.body.style.cursor = connectionMode.active ? 'crosshair' : 'pointer';
        }}
        onMouseLeave={() => {
          setHoveredPort(null);
          document.body.style.cursor = 'auto';
        }}
        aria-label={globalId}
        title={globalId}
      />
    );
  };

  const portButtons = layout
    ? portLayouts.map((port) => renderPortButton(port))
    : null;

  const renderSlotLines = (rack: RackLayout, keyPrefix: string) =>
    Array.from({ length: rackSize + 1 }, (_, index) => (
      <div
        key={`${keyPrefix}-slot-${index}`}
        className="absolute left-0 w-full border-t"
        style={{
          top: rack.height - index * rack.slotHeightPx,
          borderColor: isDarkBackground ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
          pointerEvents: 'none',
        }}
      />
    ));

  const renderEquipmentBlocks = (rack: RackLayout, side: 'front' | 'back') =>
    equipment.map((eq) => {
      const top = rack.height - (eq.slotPosition - 1 + eq.heightU) * rack.slotHeightPx;
      const height = eq.heightU * rack.slotHeightPx;
      const isSelected = selectedEquipmentId === eq.instanceId;
      const primaryLabel = eq.customLabel ?? eq.model;
      const secondaryLabel = showLabelOverlays && eq.customLabel ? eq.model : null;
      const isBackView = side === 'back';
      const shelfPlan = eq.type === 'shelf' ? shelfPlans.get(eq.instanceId)?.[side] ?? null : null;
      const shelfItems = eq.type === 'shelf' ? shelfItemsMap[eq.instanceId] ?? [] : [];

      const shelfPlanNode = shelfPlan ? (
        <div
          className="absolute rounded-sm border"
          data-viewport-interactive="true"
          style={{
            left: shelfPlan.planLeft - rack.left,
            top: shelfPlan.planTop - rack.top - top,
            width: shelfPlan.planWidth,
            height: shelfPlan.planHeight,
            background: isDarkBackground
              ? 'linear-gradient(180deg, rgba(148,163,184,0.25), rgba(15,23,42,0.5))'
              : 'linear-gradient(180deg, rgba(248,250,252,0.95), rgba(148,163,184,0.35))',
            borderColor: isDarkBackground ? 'rgba(148,163,184,0.45)' : 'rgba(71,85,105,0.4)',
            boxShadow: isDarkBackground ? 'inset 0 0 0 1px rgba(15,23,42,0.5)' : 'inset 0 0 0 1px rgba(226,232,240,0.6)',
            opacity: isBackView ? 0.85 : 1,
            overflow: 'hidden',
          }}
        >
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: isDarkBackground
                ? 'linear-gradient(90deg, rgba(148,163,184,0.15) 1px, transparent 1px), linear-gradient(180deg, rgba(148,163,184,0.15) 1px, transparent 1px)'
                : 'linear-gradient(90deg, rgba(148,163,184,0.2) 1px, transparent 1px), linear-gradient(180deg, rgba(148,163,184,0.2) 1px, transparent 1px)',
              backgroundSize: '12px 12px',
              opacity: 0.45,
            }}
          />
          {shelfItems.map((item) => {
            const rotated = getRotatedDimensions(item.width, item.depth, item.position.rotation);
            const xOffset = side === 'back'
              ? shelfPlan.usableWidthMm - (item.position.x + rotated.width)
              : item.position.x;
            const itemLeft = xOffset * shelfPlan.scaleX;
            const itemTop = item.position.z * shelfPlan.scaleZ;
            const itemWidth = Math.max(1, rotated.width * shelfPlan.scaleX);
            const itemHeight = Math.max(1, rotated.depth * shelfPlan.scaleZ);
            const itemLabel = item.customLabel ?? item.model ?? item.name;
            const showLabel = showLabelOverlays && itemHeight > 14 && itemWidth > 24;
            const isShelfItemSelected = selectedEquipmentId === item.instanceId;

            return (
              <div
                key={`${side}-${item.instanceId}`}
                className="absolute flex items-center px-1 text-[10px]"
                data-viewport-interactive="true"
                style={{
                  left: itemLeft,
                  top: itemTop,
                  width: itemWidth,
                  height: itemHeight,
                  backgroundColor: item.color,
                  color: isDarkBackground ? '#f8fafc' : '#111827',
                  border: isShelfItemSelected ? `1px solid ${UI_COLORS.SELECTION}` : '1px solid rgba(0,0,0,0.35)',
                  boxSizing: 'border-box',
                  filter: isBackView ? 'brightness(0.85)' : undefined,
                }}
                title={itemLabel}
                onClick={(event) => {
                  event.stopPropagation();
                  selectEquipment(item.instanceId);
                }}
              >
                {showLabel && <span className="truncate">{itemLabel}</span>}
              </div>
            );
          })}
          {shelfItems.length === 0 && (
            <div
              className="absolute inset-0 flex items-center justify-center text-[10px]"
              style={{ color: isDarkBackground ? 'rgba(148,163,184,0.7)' : 'rgba(71,85,105,0.6)' }}
            >
              Empty shelf
            </div>
          )}
        </div>
      ) : null;

      return (
        <div
          key={`${side}-${eq.instanceId}`}
          className="absolute left-0 text-xs"
          data-viewport-interactive="true"
          style={{
            top,
            width: rack.width,
            height,
            backgroundColor: eq.color,
            color: isDarkBackground ? '#f8fafc' : '#111827',
            border: isSelected ? `2px solid ${UI_COLORS.SELECTION}` : '1px solid rgba(0,0,0,0.25)',
            boxSizing: 'border-box',
            filter: isBackView ? 'brightness(0.85)' : undefined,
          }}
          onClick={(event) => {
            event.stopPropagation();
            selectEquipment(eq.instanceId);
          }}
          title={primaryLabel}
        >
          {shelfPlanNode}
          <div
            className="absolute inset-0 flex items-center justify-between px-2"
            style={{ pointerEvents: 'none' }}
          >
            <span className="truncate">{primaryLabel}</span>
            {secondaryLabel && (
              <span className="text-[10px] opacity-80 truncate">
                {secondaryLabel}
              </span>
            )}
          </div>
        </div>
      );
    });

  const rackHoverOverlay = layout && rackHover
    ? (
      <div
        className="absolute left-0"
        style={{
          top: layout.front.height - (rackHover.start - 1 + rackHover.count) * layout.front.slotHeightPx,
          width: layout.front.width,
          height: rackHover.count * layout.front.slotHeightPx,
          backgroundColor: rackHover.valid ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)',
          border: `1px solid ${rackHover.valid ? UI_COLORS.VALID_DROP : UI_COLORS.INVALID_DROP}`,
          pointerEvents: 'none',
        }}
      />
    )
    : null;

  const cableLines = layout ? (
    <svg
      className="absolute inset-0 pointer-events-auto"
      width={layout.containerWidth}
      height={layout.containerHeight}
    >
      {cables.map((cable) => {
        const start = portPositionsById.get(cable.sourcePortId);
        const end = portPositionsById.get(cable.targetPortId);
        if (!start || !end) return null;
        const isSelected = selectedCableId === cable.id;
        return (
          <line
            key={cable.id}
            x1={start.screenX}
            y1={start.screenY}
            x2={end.screenX}
            y2={end.screenY}
            stroke={cable.color.hex}
            strokeWidth={isSelected ? 3 : 2}
            opacity={isSelected ? 0.95 : 0.6}
            data-viewport-interactive="true"
            style={{ cursor: 'pointer', pointerEvents: 'stroke' }}
            onClick={(event) => {
              event.stopPropagation();
              selectCable(cable.id);
            }}
          />
        );
      })}
    </svg>
  ) : null;

  return (
    <div
      ref={containerRef}
      className="absolute inset-0"
      data-rack-fallback="true"
      style={{ touchAction: 'none' }}
      onClick={(event) => {
        if (panGestureRef.current) {
          panGestureRef.current = false;
          return;
        }
        if (isInteractiveTarget(event.target)) {
          return;
        }
        clearSelection();
      }}
      onPointerDown={(event) => {
        if (isDragging) return;
        const isPanButton = event.button === 1 || event.button === 2;
        if (!isPanButton && isInteractiveTarget(event.target)) {
          return;
        }
        if (isPanButton) {
          event.preventDefault();
        }
        isPanningRef.current = true;
        panGestureRef.current = false;
        lastPointerRef.current = { x: event.clientX, y: event.clientY };
        (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
      }}
      onPointerMove={(event) => {
        if (!isPanningRef.current || isDragging) return;
        const dx = event.clientX - lastPointerRef.current.x;
        const dy = event.clientY - lastPointerRef.current.y;
        if (Math.abs(dx) + Math.abs(dy) > 1) {
          panGestureRef.current = true;
        }
        lastPointerRef.current = { x: event.clientX, y: event.clientY };
        setPan((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
      }}
      onPointerUp={(event) => {
        if (!isPanningRef.current) return;
        isPanningRef.current = false;
        (event.currentTarget as HTMLElement).releasePointerCapture(event.pointerId);
      }}
      onPointerCancel={(event) => {
        if (!isPanningRef.current) return;
        isPanningRef.current = false;
        (event.currentTarget as HTMLElement).releasePointerCapture(event.pointerId);
      }}
      onContextMenu={(event) => {
        if (isPanningRef.current) {
          event.preventDefault();
        }
      }}
      onWheel={(event) => {
        if (!layout || isDragging) return;
        event.preventDefault();
        const direction = event.deltaY < 0 ? 1.1 : 0.9;
        const nextZoom = Math.min(3, Math.max(0.5, zoom * direction));
        if (nextZoom === zoom) return;

        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;
        const cursorX = event.clientX - rect.left;
        const cursorY = event.clientY - rect.top;

        const relX = layout.contentWidth > 0 ? (cursorX - layout.contentLeft) / layout.contentWidth : 0.5;
        const relY = layout.contentHeight > 0 ? (cursorY - layout.contentTop) / layout.contentHeight : 0.5;
        const zoomRatio = nextZoom / zoom;
        const newContentWidth = layout.contentWidth * zoomRatio;
        const newContentHeight = layout.contentHeight * zoomRatio;

        const newContentLeft = cursorX - relX * newContentWidth;
        const newContentTop = cursorY - relY * newContentHeight;
        const newPanX = newContentLeft - (layout.containerWidth - newContentWidth) / 2;
        const newPanY = newContentTop - (layout.containerHeight - newContentHeight) / 2;

        setZoom(nextZoom);
        setPan({ x: newPanX, y: newPanY });
      }}
      onDoubleClick={() => {
        setZoom(1);
        setPan({ x: 0, y: 0 });
      }}
    >
      {layout && (
        <>
          <div
            className="absolute text-xs font-semibold tracking-wide uppercase"
            style={{
              left: layout.front.left,
              top: layout.front.top - 18,
              color: isDarkBackground ? '#e2e8f0' : '#334155',
            }}
          >
            Front
          </div>
          <div
            className="absolute text-xs font-semibold tracking-wide uppercase"
            style={{
              left: layout.back.left,
              top: layout.back.top - 18,
              color: isDarkBackground ? '#e2e8f0' : '#334155',
            }}
          >
            Back
          </div>
          <div
            className="absolute"
            style={{
              left: layout.front.left,
              top: layout.front.top,
              width: layout.front.width,
              height: layout.front.height,
              background: isDarkBackground ? '#0f0f10' : '#f3f4f6',
              border: isDarkBackground ? '1px solid rgba(148,163,184,0.4)' : '1px solid rgba(71,85,105,0.4)',
              boxShadow: isDarkBackground ? '0 0 0 1px rgba(30,41,59,0.8)' : '0 0 0 1px rgba(226,232,240,0.8)',
            }}
            onClick={(event) => event.stopPropagation()}
          >
            {renderSlotLines(layout.front, 'front')}
            {renderEquipmentBlocks(layout.front, 'front')}
            {rackHoverOverlay}
          </div>
          <div
            className="absolute"
            style={{
              left: layout.back.left,
              top: layout.back.top,
              width: layout.back.width,
              height: layout.back.height,
              background: isDarkBackground ? '#0f0f10' : '#f3f4f6',
              border: isDarkBackground ? '1px solid rgba(148,163,184,0.4)' : '1px solid rgba(71,85,105,0.4)',
              boxShadow: isDarkBackground ? '0 0 0 1px rgba(30,41,59,0.8)' : '0 0 0 1px rgba(226,232,240,0.8)',
            }}
            onClick={(event) => event.stopPropagation()}
          >
            {renderSlotLines(layout.back, 'back')}
            {renderEquipmentBlocks(layout.back, 'back')}
          </div>
          {cableLines}
          {portButtons}
        </>
      )}
      {children}
    </div>
  );
}
