'use client';

import { useRef } from 'react';
import jsPDF from 'jspdf';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useConnectionStore, useRackStore, useUIStore } from '@/stores';
import { PORT_TYPE_LABELS } from '@/types/port';

type LegendPort = {
  id: string;
  label: string;
  customLabel?: string;
  type: string;
};

type LegendEquipment = {
  id: string;
  name: string;
  model: string;
  customLabel?: string;
  ports: LegendPort[];
};


function formatPortIdentifier(port: LegendPort) {
  const digits = port.label.match(/\d+/);
  if (port.type.startsWith('rj45')) {
    if (digits) return `RJ45 ${digits[0]}`;
    if (port.label.toLowerCase().includes('wan')) return 'RJ45 WAN';
    return `RJ45 ${port.label}`;
  }
  if (port.type === 'sfp-plus') {
    if (digits) return `SFP+ ${digits[0]}`;
    return `SFP+ ${port.label}`;
  }
  return `${PORT_TYPE_LABELS[port.type as keyof typeof PORT_TYPE_LABELS] ?? port.type} ${port.label}`.trim();
}

function downloadBlob(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function ExportPanel() {
  const equipment = useRackStore((state) => state.equipment);
  const rackName = useRackStore((state) => state.rack.config.name);
  const importConfig = useRackStore((state) => state.importConfig);
  const exportConfig = useRackStore((state) => state.exportConfig);
  const cables = useConnectionStore((state) => state.cables);
  const importCables = useConnectionStore((state) => state.importCables);
  const setIsExporting = useUIStore((state) => state.setIsExporting);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Create a sanitized filename from rack name
  const sanitizeFilename = (name: string) => {
    return name.replace(/[^a-zA-Z0-9-_]/g, '-').replace(/-+/g, '-').toLowerCase();
  };

  const equipmentLegend: LegendEquipment[] = equipment
    .slice()
    .sort((a, b) => a.slotPosition - b.slotPosition)
    .map((item) => ({
      id: item.instanceId,
      name: item.name,
      model: item.model,
      customLabel: item.customLabel,
      ports: item.ports.map((port) => ({
        id: port.id,
        label: port.label,
        customLabel: port.customLabel,
        type: port.type,
      })),
    }));

  const portLabelMap = new Map(
    equipmentLegend.flatMap((item) =>
      item.ports.map((port) => [
        `${item.id}-${port.id}`,
        { port, equipment: item },
      ])
    )
  );

  const handleExportJson = () => {
    const payload = {
      rack: exportConfig().rack,
      equipment: exportConfig().equipment,
      cables,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const filename = `${sanitizeFilename(rackName)}-config.json`;
    downloadBlob(filename, blob);
  };

  const handleImportJson = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const payload = JSON.parse(text);
    if (payload?.rack && payload?.equipment) {
      importConfig(payload.rack, payload.equipment);
    }
    if (payload?.cables) {
      importCables(payload.cables);
    }
    event.target.value = '';
  };

  const handleExportCsv = () => {
    const rows = [
      ['# Rack Name', rackName],
      [],
      [
        'cableId',
        'cableLabel',
        'cableLengthMm',
        'cableType',
        'cableColor',
        'sourceEquipmentId',
        'sourceEquipmentModel',
        'sourceEquipmentLabel',
        'sourcePortId',
        'sourcePortLabel',
        'sourcePortCustomLabel',
        'sourcePortType',
        'targetEquipmentId',
        'targetEquipmentModel',
        'targetEquipmentLabel',
        'targetPortId',
        'targetPortLabel',
        'targetPortCustomLabel',
        'targetPortType',
      ],
    ];

    cables.forEach((cable) => {
      const source = portLabelMap.get(cable.sourcePortId);
      const target = portLabelMap.get(cable.targetPortId);
      rows.push([
        cable.id,
        cable.label ?? '',
        cable.length ? String(cable.length) : '',
        cable.type,
        cable.color.name,
        source?.equipment.id ?? '',
        source?.equipment.model ?? '',
        source?.equipment.customLabel ?? source?.equipment.name ?? '',
        source?.port.id ?? '',
        source ? formatPortIdentifier(source.port) : '',
        source?.port.customLabel ?? '',
        source?.port.type ?? '',
        target?.equipment.id ?? '',
        target?.equipment.model ?? '',
        target?.equipment.customLabel ?? target?.equipment.name ?? '',
        target?.port.id ?? '',
        target ? formatPortIdentifier(target.port) : '',
        target?.port.customLabel ?? '',
        target?.port.type ?? '',
      ]);
    });

    const csv = rows
      .map((row) =>
        row
          .map((value) => {
            const escaped = String(value).replace(/"/g, '""');
            return `"${escaped}"`;
          })
          .join(',')
      )
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const filename = `${sanitizeFilename(rackName)}-cables.csv`;
    downloadBlob(filename, blob);
  };


  const buildExportCanvas = async () => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return null;

    const canvasWidth = canvas.clientWidth;
    const canvasHeight = canvas.clientHeight;
    const uiState = useUIStore.getState();
    const bounds = uiState.rackScreenBounds ?? { left: 0, top: 0, width: canvasWidth, height: canvasHeight };
    const padding = Math.max(8, Math.round(bounds.height * 0.04));
    const cropLeft = Math.max(0, bounds.left - padding);
    const cropTop = Math.max(0, bounds.top - padding);
    const cropRight = Math.min(canvasWidth, bounds.left + bounds.width + padding);
    const cropBottom = Math.min(canvasHeight, bounds.top + bounds.height + padding);
    const cropWidth = Math.max(1, cropRight - cropLeft);
    const cropHeight = Math.max(1, cropBottom - cropTop);

    const scaleX = canvas.width / canvasWidth;
    const scaleY = canvas.height / canvasHeight;
    const sourceX = cropLeft * scaleX;
    const sourceY = cropTop * scaleY;
    const sourceWidth = cropWidth * scaleX;
    const sourceHeight = cropHeight * scaleY;

    const rackCanvas = document.createElement('canvas');
    rackCanvas.width = Math.max(1, Math.round(sourceWidth));
    rackCanvas.height = Math.max(1, Math.round(sourceHeight));
    const rackContext = rackCanvas.getContext('2d');
    if (!rackContext) return null;
    rackContext.drawImage(
      canvas,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      0,
      0,
      rackCanvas.width,
      rackCanvas.height
    );

    const baseExportHeight = Math.round(bounds.height / 0.9);

    // Resolution multiplier for higher quality export (2x for retina-quality)
    const dpiScale = 2;

    // Create a temporary canvas to measure text
    const measureCanvas = document.createElement('canvas');
    const measureContext = measureCanvas.getContext('2d');
    if (!measureContext) return null;

    // Font sizes (will be scaled by dpiScale when drawing)
    const basemodelFontSize = 14;
    const baseCustomLabelFontSize = 12;
    const modelFont = `600 ${basemodelFontSize}px Arial`;
    const customLabelFont = `400 ${baseCustomLabelFontSize}px Arial`;

    // Calculate maximum label width needed for inline equipment labels
    let maxLabelWidth = 0;
    equipment.forEach((eq) => {
      measureContext.font = modelFont;
      const modelWidth = measureContext.measureText(eq.model).width;
      let labelWidth = modelWidth;
      if (eq.customLabel) {
        measureContext.font = customLabelFont;
        labelWidth = Math.max(labelWidth, measureContext.measureText(eq.customLabel).width);
      }
      maxLabelWidth = Math.max(maxLabelWidth, labelWidth);
    });

    // Layout: [left labels] + [rack image] + [right labels] (in logical pixels)
    const labelGap = 40; // Gap between rack and labels
    const labelPadding = 16; // Outer padding for labels
    const labelAreaWidth = Math.max(180, maxLabelWidth + labelPadding);
    const rackImageWidth = Math.round(baseExportHeight * 0.4); // Rack takes ~40% of height as width
    const titleHeight = 60; // Space for rack name title at top

    const layout = {
      exportWidth: labelAreaWidth + labelGap + rackImageWidth + labelGap + labelAreaWidth,
      exportHeight: baseExportHeight + titleHeight,
      leftLabelAreaWidth: labelAreaWidth,
      rackImageWidth,
      rightLabelAreaWidth: labelAreaWidth,
      labelGap,
      titleHeight,
    };

    // Create high-resolution canvas
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = layout.exportWidth * dpiScale;
    exportCanvas.height = layout.exportHeight * dpiScale;
    const context = exportCanvas.getContext('2d');
    if (!context) return null;

    // Scale all drawing operations for high DPI
    context.scale(dpiScale, dpiScale);

    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, layout.exportWidth, layout.exportHeight);

    // Draw rack name title at the top
    const titleFont = `700 24px Arial`;
    context.font = titleFont;
    context.fillStyle = '#111827';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(rackName, layout.exportWidth / 2, layout.titleHeight / 2);
    context.textAlign = 'left'; // Reset alignment

    // Calculate rack image position (centered between label areas, below title)
    const contentAreaHeight = layout.exportHeight - layout.titleHeight;
    const rackAreaStart = layout.leftLabelAreaWidth + layout.labelGap;
    const rackTargetHeight = contentAreaHeight * 0.9;
    const maxRenderHeight = contentAreaHeight * 0.95;
    const maxWidth = layout.rackImageWidth * 0.95;
    let scale = rackTargetHeight / Math.max(1, bounds.height);
    scale = Math.min(scale, maxWidth / Math.max(1, cropWidth), maxRenderHeight / Math.max(1, cropHeight));
    const renderWidth = Math.max(1, Math.round(cropWidth * scale));
    const renderHeight = Math.max(1, Math.round(cropHeight * scale));
    const imageX = rackAreaStart + Math.round((layout.rackImageWidth - renderWidth) / 2);
    const imageY = layout.titleHeight + Math.round((contentAreaHeight - renderHeight) / 2);

    context.drawImage(rackCanvas, imageX, imageY, renderWidth, renderHeight);

    // Draw inline equipment labels alternating left and right
    const equipmentScreenBounds = uiState.equipmentScreenBounds;
    if (equipmentScreenBounds) {
      // Create a map for quick equipment lookup by instanceId
      const equipmentMap = new Map(equipment.map((eq) => [eq.instanceId, eq]));

      // Collect all label data with their natural Y positions
      type LabelData = {
        eq: typeof equipment[0];
        canvasTop: number;
        canvasHeight: number;
        canvasLeft: number;
        canvasRight: number;
        naturalY: number;
        adjustedY: number;
        side: 'left' | 'right';
      };
      const allLabels: LabelData[] = [];

      equipmentScreenBounds.forEach((eqBounds) => {
        const eq = equipmentMap.get(eqBounds.instanceId);
        if (!eq) return;

        // Check if equipment bounds are within crop area
        if (
          eqBounds.left + eqBounds.width < cropLeft ||
          eqBounds.left > cropLeft + cropWidth ||
          eqBounds.top + eqBounds.height < cropTop ||
          eqBounds.top > cropTop + cropHeight
        ) {
          return;
        }

        // Transform equipment bounds to export canvas coordinates
        const canvasTop = imageY + (eqBounds.top - cropTop) * scale;
        const canvasHeight = eqBounds.height * scale;
        const canvasLeft = imageX + (eqBounds.left - cropLeft) * scale;
        const canvasRight = imageX + (eqBounds.left + eqBounds.width - cropLeft) * scale;

        // Calculate vertical center of equipment
        const naturalY = canvasTop + canvasHeight / 2;

        allLabels.push({
          eq,
          canvasTop,
          canvasHeight,
          canvasLeft,
          canvasRight,
          naturalY,
          adjustedY: naturalY,
          side: 'right', // Will be assigned later
        });
      });

      // Sort by Y position (top to bottom)
      allLabels.sort((a, b) => a.naturalY - b.naturalY);

      // Alternate labels between left and right sides
      allLabels.forEach((label, index) => {
        label.side = index % 2 === 0 ? 'right' : 'left';
      });

      // Separate into left and right groups
      const leftLabels = allLabels.filter((l) => l.side === 'left');
      const rightLabels = allLabels.filter((l) => l.side === 'right');

      // Adjust Y positions to prevent overlap (separately for each side)
      const minLabelSpacing = 32; // Minimum vertical space between label centers
      const adjustOverlaps = (labels: LabelData[]) => {
        for (let i = 1; i < labels.length; i++) {
          const prev = labels[i - 1];
          const curr = labels[i];
          const minY = prev.adjustedY + minLabelSpacing;
          if (curr.adjustedY < minY) {
            curr.adjustedY = minY;
          }
        }
      };

      adjustOverlaps(leftLabels);
      adjustOverlaps(rightLabels);

      // Draw labels
      const drawLabel = (data: LabelData) => {
        const { eq, canvasTop, canvasHeight, canvasLeft, canvasRight, adjustedY, side } = data;
        const equipmentCenterY = canvasTop + canvasHeight / 2;

        // Calculate label X position based on side
        const isLeft = side === 'left';
        const labelX = isLeft
          ? layout.leftLabelAreaWidth - labelPadding
          : layout.leftLabelAreaWidth + layout.labelGap + layout.rackImageWidth + layout.labelGap + labelPadding;

        // Draw connecting line from equipment edge to label
        context.strokeStyle = '#9ca3af';
        context.lineWidth = 1;
        context.beginPath();

        const equipmentEdgeX = isLeft ? canvasLeft - 2 : canvasRight + 2;
        const lineEndX = isLeft ? labelX + 8 : labelX - 8;

        context.moveTo(equipmentEdgeX, equipmentCenterY);

        if (Math.abs(adjustedY - equipmentCenterY) > 2) {
          // Draw stepped line when label is offset
          const midX = equipmentEdgeX + (lineEndX - equipmentEdgeX) * 0.4;
          context.lineTo(midX, equipmentCenterY);
          context.lineTo(midX, adjustedY);
          context.lineTo(lineEndX, adjustedY);
        } else {
          context.lineTo(lineEndX, equipmentCenterY);
        }
        context.stroke();

        // Set text alignment based on side
        context.textAlign = isLeft ? 'right' : 'left';

        // Draw model name (bold)
        context.font = modelFont;
        context.fillStyle = '#111827';
        context.textBaseline = 'middle';
        const modelY = eq.customLabel ? adjustedY - 8 : adjustedY;
        context.fillText(eq.model, labelX, modelY);

        // Draw custom label underneath if set
        if (eq.customLabel) {
          context.font = customLabelFont;
          context.fillStyle = '#4b5563';
          context.fillText(eq.customLabel, labelX, adjustedY + 8);
        }
      };

      // Draw all labels
      leftLabels.forEach(drawLabel);
      rightLabels.forEach(drawLabel);

      // Reset text alignment
      context.textAlign = 'left';
    }

    return {
      canvas: exportCanvas,
      width: layout.exportWidth,
      height: layout.exportHeight,
    };
  };

  const handleExportImage = async (format: 'png' | 'pdf') => {
    setIsExporting(true);
    const start = performance.now();
    const expectedPortCount = equipmentLegend.reduce((sum, item) => sum + item.ports.length, 0);
    await new Promise<void>((resolve) => {
      const tick = () => {
        const state = useUIStore.getState();
        const hasRackBounds = !!state.rackScreenBounds && state.rackScreenBounds.height > 0;
        const hasPorts = expectedPortCount === 0 || !!state.portScreenPositions;
        if (state.exportCameraReady && hasRackBounds && hasPorts) {
          resolve();
          return;
        }
        if (performance.now() - start > 1500) {
          resolve();
          return;
        }
        requestAnimationFrame(tick);
      };
      tick();
    });
    await new Promise((resolve) => requestAnimationFrame(resolve));
    let layout: Awaited<ReturnType<typeof buildExportCanvas>> | null = null;
    try {
      layout = await buildExportCanvas();
    } finally {
      setIsExporting(false);
    }
    if (!layout) return;

    const baseFilename = sanitizeFilename(rackName);

    if (format === 'png') {
      layout.canvas.toBlob((blob) => {
        if (!blob) return;
        downloadBlob(`${baseFilename}-export.png`, blob);
      });
      return;
    }

    const imgData = layout.canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: layout.width >= layout.height ? 'landscape' : 'portrait',
      unit: 'px',
      format: [layout.width, layout.height],
    });
    pdf.addImage(imgData, 'PNG', 0, 0, layout.width, layout.height);
    pdf.save(`${baseFilename}-export.pdf`);
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Export Options</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <Button size="sm" onClick={handleExportJson}>Export JSON</Button>
          <Button size="sm" variant="outline" onClick={() => fileInputRef.current?.click()}>
            Import JSON
          </Button>
          <Button size="sm" onClick={() => handleExportImage('png')}>Export PNG</Button>
          <Button size="sm" onClick={() => handleExportImage('pdf')}>Export PDF</Button>
          <Button size="sm" onClick={handleExportCsv}>Export CSV</Button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={handleImportJson}
        />
      </CardContent>
    </Card>
  );
}
