// Standard rack dimensions
export const RACK_CONSTANTS = {
  // Standard 19" rack width in mm
  STANDARD_WIDTH_MM: 482.6,
  STANDARD_WIDTH_INCHES: 19,

  // 1U height in mm (1.75 inches)
  U_HEIGHT_MM: 44.45,
  U_HEIGHT_INCHES: 1.75,

  // Common rack depths in mm
  DEPTHS: {
    SHORT: 600,
    STANDARD: 800,
    DEEP: 1000,
    EXTRA_DEEP: 1200,
  },

  // Available rack sizes
  SIZES: [42, 48] as const,

  // Mounting rail dimensions
  RAIL_WIDTH_MM: 15.875, // 5/8 inch
  RAIL_HOLE_SPACING_MM: 12.7, // 0.5 inch

  // Equipment mounting hole pattern (EIA-310)
  HOLE_PATTERN: {
    TOP_OFFSET: 6.35, // mm from top of U
    MIDDLE_OFFSET: 15.88, // mm from top of U
    BOTTOM_OFFSET: 25.4, // mm from top of U
  },
};

// 3D scene scale factor (1 unit = 100mm for easier visualization)
export const SCALE_FACTOR = 0.01;

// Convert mm to scene units
export function mmToScene(mm: number): number {
  return mm * SCALE_FACTOR;
}

// Convert U height to scene units
export function uToScene(u: number): number {
  return u * RACK_CONSTANTS.U_HEIGHT_MM * SCALE_FACTOR;
}

// Get rack height in scene units
export function getRackHeight(size: number): number {
  return uToScene(size);
}

// Get rack width in scene units
export function getRackWidth(): number {
  return mmToScene(RACK_CONSTANTS.STANDARD_WIDTH_MM);
}
