// Re-export all types
export * from './rack';
export * from './equipment';
export * from './port';
export * from './cable';
export * from './shelf';

// Application state types
export interface ConnectionMode {
  active: boolean;
  sourcePortId: string | null;
  cableType: import('./cable').CableType;
  cableColor: import('./cable').CableColor;
}

// Export configuration
export interface ExportConfig {
  format: 'json' | 'pdf' | 'png' | 'csv';
  includeConnections: boolean;
  includeLabels: boolean;
}
