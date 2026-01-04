// Equipment colors
export const EQUIPMENT_COLORS = {
  // Ubiquiti-style silver/grey
  UBIQUITI_SILVER: '#a8a8a8',
  UBIQUITI_DARK: '#2a2a2a',

  // Generic equipment colors
  BLACK: '#1a1a1a',
  DARK_GRAY: '#2d2d2d',
  STEEL: '#4a4a4a',

  // Accent colors
  DISPLAY_BLUE: '#0066cc',
  LED_GREEN: '#00ff00',
  LED_AMBER: '#ffaa00',
  LED_RED: '#ff0000',
};

// Port colors by type
export const PORT_COLORS = {
  RJ45_LAN: '#22c55e', // Green
  RJ45_WAN: '#f59e0b', // Amber
  SFP_PLUS: '#3b82f6', // Blue
  USB: '#6b7280', // Gray
  POWER: '#ef4444', // Red
  UK_OUTLET: '#1f2937', // Dark gray
};

// Selection and highlight colors
export const UI_COLORS = {
  SELECTION: '#3b82f6', // Blue
  HOVER: '#60a5fa', // Light blue
  VALID_DROP: '#22c55e', // Green
  INVALID_DROP: '#ef4444', // Red
  CONNECTION_SOURCE: '#f59e0b', // Amber
};

// Rack frame colors
export const RACK_COLORS = {
  FRAME: '#1f1f1f',
  RAILS: '#3a3a3a',
  SLOT_EMPTY: '#0a0a0a',
  SLOT_HOVER: '#1a1a2a',
};

// CRT Theme colors
export const CRT_COLORS = {
  // Primary amber tones
  AMBER: '#d97706',
  AMBER_BRIGHT: '#f59e0b',
  AMBER_GLOW: '#fbbf24',
  AMBER_DIM: '#92400e',

  // Dark backgrounds
  TERMINAL_BG_DARK: '#0a0908',
  TERMINAL_BG_LIGHT: '#1a1815',

  // Text colors
  TEXT_AMBER: '#fbbf24',
  TEXT_AMBER_DIM: '#d97706',
};

// Viewport background colors (for 3D scene)
export const VIEWPORT_COLORS = {
  LIGHT: '#1a1815', // Warm dark for light mode
  DARK: '#0a0908', // Deep black for dark mode
};

// Grid colors for 3D scene (CRT themed)
export const GRID_COLORS = {
  LIGHT: {
    CELL: '#3d3428',
    SECTION: '#5c4d3a',
  },
  DARK: {
    CELL: '#2a2318',
    SECTION: '#4a3d2a',
  },
};
