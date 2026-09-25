/**
 * Body color belongs on exterior painted panels only.
 * The cabin colors below are a schematic black interior, not a factory surface and not OEM CAD.
 */

export const BODY_PAINT = "#f3f0ea";

export const EXTERIOR_PAINT_TARGETS = ["body-shell", "mirror-cap"] as const;

export const GLASS_SURFACES = ["greenhouse", "body-xray"] as const;

export const CABIN_SURFACE_NAMES = [
  "dash",
  "instrument-panel",
  "console",
  "carpet",
  "footwell",
  "charge-pad",
  "seat",
  "door-panel",
  "headliner",
] as const;

export const CABIN_COLORS = {
  dash: "#323840",
  carpet: "#2c3138",
  pad: "#6d767f",
  padWell: "#1a1d22",
  upholstery: "#46505c",
} as const;

const EXTERIOR = new Set<string>(EXTERIOR_PAINT_TARGETS);
const GLASS = new Set<string>(GLASS_SURFACES);

export function isExteriorPaintTarget(name: string): boolean {
  return EXTERIOR.has(name);
}

export function isGlassSurface(name: string): boolean {
  return GLASS.has(name);
}

export function isCabinSurface(name: string): boolean {
  for (const surface of CABIN_SURFACE_NAMES) {
    if (name === surface || name.startsWith(`${surface}-`)) return true;
  }
  return false;
}
