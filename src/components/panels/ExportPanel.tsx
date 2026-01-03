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

type LegendLine = {
  text: string;
  font: string;
  lineHeight: number;
  color?: string;
  spacer?: boolean;
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

function formatPortOverlayLabel(port: LegendPort) {
  const digits = port.label.match(/\d+/);
  return digits ? digits[0] : port.label;
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
  const importConfig = useRackStore((state) => state.importConfig);
  const exportConfig = useRackStore((state) => state.exportConfig);
  const cables = useConnectionStore((state) => state.cables);
  const importCables = useConnectionStore((state) => state.importCables);
  const setIsExporting = useUIStore((state) => state.setIsExporting);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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
    downloadBlob('rack-config.json', blob);
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
    downloadBlob('rack-cables.csv', blob);
  };

  const wrapTextLines = (
    text: string,
    maxWidth: number,
    context: CanvasRenderingContext2D
  ) => {
    const words = text.split(' ');
    const lines: string[] = [];
    let line = '';
    words.forEach((word) => {
      const next = line ? `${line} ${word}` : word;
      if (context.measureText(next).width > maxWidth && line) {
        lines.push(line);
        line = word;
      } else {
        line = next;
      }
    });
    if (line) lines.push(line);
    return lines;
  };

  const buildLegendLines = (context: CanvasRenderingContext2D, maxWidth: number) => {
    const lines: LegendLine[] = [];
    const pushWrapped = (text: string, font: string, lineHeight: number, color?: string) => {
      context.font = font;
      wrapTextLines(text, maxWidth, context).forEach((line) => {
        lines.push({ text: line, font, lineHeight, color });
      });
    };

    pushWrapped('Rack Legend', '600 18px Arial', 24, '#111827');
    lines.push({ text: '', font: '', lineHeight: 8, spacer: true });

    equipmentLegend.forEach((item, index) => {
      if (index > 0) {
        lines.push({ text: '', font: '', lineHeight: 8, spacer: true });
      }
      pushWrapped(`${item.model}: ${item.customLabel ?? item.name}`, '600 14px Arial', 20, '#111827');
      item.ports.forEach((port) => {
        const label = `- ${formatPortIdentifier(port)}: ${port.customLabel ?? ''}`.trim();
        pushWrapped(label, '400 12px Arial', 16, '#111827');
      });
    });

    return lines;
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
    const legendProbe = document.createElement('canvas');
    const legendContext = legendProbe.getContext('2d');
    if (!legendContext) return null;

    const buildLayout = (targetHeight: number) => {
      const leftWidth = Math.round(targetHeight * 0.9);
      const legendWidth = Math.max(360, leftWidth);
      const legendLines = buildLegendLines(legendContext, legendWidth - 32);
      const legendHeight =
        legendLines.reduce((sum, line) => sum + line.lineHeight, 0) + 32;
      const exportHeight = Math.max(targetHeight, legendHeight);
      return {
        exportHeight,
        leftWidth,
        legendWidth,
        exportWidth: leftWidth + legendWidth,
        legendLines,
        legendHeight,
      };
    };

    let layout = buildLayout(baseExportHeight);
    if (layout.legendHeight > baseExportHeight) {
      layout = buildLayout(layout.legendHeight);
    }

    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = layout.exportWidth;
    exportCanvas.height = layout.exportHeight;
    const context = exportCanvas.getContext('2d');
    if (!context) return null;

    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, layout.exportWidth, layout.exportHeight);

    const rackTargetHeight = layout.exportHeight * 0.9;
    const maxRenderHeight = layout.exportHeight * 0.95;
    const maxWidth = layout.leftWidth * 0.95;
    let scale = rackTargetHeight / Math.max(1, bounds.height);
    scale = Math.min(scale, maxWidth / Math.max(1, cropWidth), maxRenderHeight / Math.max(1, cropHeight));
    const renderWidth = Math.max(1, Math.round(cropWidth * scale));
    const renderHeight = Math.max(1, Math.round(cropHeight * scale));
    const imageX = Math.round((layout.leftWidth - renderWidth) / 2);
    const imageY = Math.round((layout.exportHeight - renderHeight) / 2);

    context.drawImage(rackCanvas, imageX, imageY, renderWidth, renderHeight);

    const portScreenPositions = uiState.portScreenPositions;
    if (portScreenPositions) {
      const offsetY = 2;
      const minY = imageY + 4;
      const maxY = imageY + renderHeight - 4;

      context.font = '700 9px Arial';
      context.textBaseline = 'bottom';
      context.lineWidth = 2;
      context.strokeStyle = 'rgba(15, 23, 42, 0.7)';
      context.fillStyle = '#f8fafc';

      portScreenPositions.forEach((position) => {
        const mapping = portLabelMap.get(position.id);
        if (!mapping) return;
        if (
          position.x < cropLeft ||
          position.x > cropLeft + cropWidth ||
          position.y < cropTop ||
          position.y > cropTop + cropHeight
        ) {
          return;
        }
        const label = formatPortOverlayLabel(mapping.port);
        const portX = imageX + (position.x - cropLeft) * scale;
        const portY = imageY + (position.y - cropTop) * scale;
        const textWidth = context.measureText(label).width;
        let labelY = portY - offsetY;
        if (labelY < minY + 6) {
          labelY = portY + 10;
          if (labelY > maxY) {
            labelY = Math.min(maxY, Math.max(minY, portY));
          }
        }
        labelY = Math.min(maxY, Math.max(minY, labelY));
        let labelX = portX - textWidth / 2;
        const minX = imageX + 2;
        const maxX = imageX + renderWidth - textWidth - 2;
        if (labelX < minX) labelX = minX;
        if (labelX > maxX) labelX = maxX;

        context.strokeText(label, labelX, labelY);
        context.fillText(label, labelX, labelY);
      });
    }

    const legendX = layout.leftWidth;
    const legendPadding = 16;
    let legendY = legendPadding;
    layout.legendLines.forEach((line) => {
      if (line.spacer) {
        legendY += line.lineHeight;
        return;
      }
      context.font = line.font;
      context.fillStyle = line.color ?? '#111827';
      context.textBaseline = 'top';
      context.fillText(line.text, legendX + legendPadding, legendY);
      legendY += line.lineHeight;
    });

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

    if (format === 'png') {
      layout.canvas.toBlob((blob) => {
        if (!blob) return;
        downloadBlob('rack-export.png', blob);
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
    pdf.save('rack-export.pdf');
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
