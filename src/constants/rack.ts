// Rack size limits (in U)
export const MIN_RACK_SIZE = 1;
export const MAX_RACK_SIZE = 48;
export const DEFAULT_RACK_SIZE = 42;

// Rack depth limits (in inches)
export const MIN_DEPTH_INCHES = 10;
export const MAX_DEPTH_INCHES = 50;
export const DEFAULT_DEPTH_INCHES = 32; // ~800mm Ubiquiti standard

// Conversion constant
export const INCH_TO_MM = 25.4;

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

// Frame dimensions for positioning
// Standard rack posts are ~20mm thick, allowing 442mm clear opening for 19" equipment
export const FRAME_THICKNESS_MM = 20;
export const RACK_DEPTH_MM = 600;

// Equipment mounting dimensions (EIA-310 standard)
// 19" equipment front panels are 482.6mm wide but mount in 450mm (17.75") opening
// The mounting ears extend beyond the chassis to reach the rails
export const EQUIPMENT_OPENING_MM = 450; // 17.75" minimum opening between rails

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
