import type { Mode } from "../model";

/** Meters. Nose is +X, up is +Y, driver side (left-hand drive) is +Z. */

export const WHEEL_R = 0.34;
export const FRONT_X = 1.4;
export const REAR_X = FRONT_X - 2.875;
export const HALF_TRACK = 0.79;

export const POSE: Record<Mode, { pos: [number, number, number]; target: [number, number, number] }> = {
  overview: { pos: [3.35, 1.48, 3.55], target: [0.15, 0.62, 0] },
  inside: { pos: [2.7, 1.85, 3.15], target: [0.05, 0.5, 0] },
  motor: { pos: [-2.55, 0.95, 1.85], target: [REAR_X, 0.4, 0] },
  battery: { pos: [0.35, 2.35, 2.05], target: [-0.15, 0.22, 0] },
  penthouse: { pos: [-3.15, 1.25, 1.7], target: [-1.85, 0.42, 0.15] },
  cooling: { pos: [0.55, 1.35, 3.85], target: [0.35, 0.48, 0] },
  computers: { pos: [2.15, 1.45, -2.55], target: [0.55, 0.78, -0.25] },
};

export type Vec3 = [number, number, number];

export const OCTOVALVE: Vec3 = [1.68, 0.48, 0.08];
export const RADIATOR: Vec3 = [2.08, 0.58, 0];
export const COMPUTER: Vec3 = [0.78, 0.78, -0.48];
export const PENTHOUSE: Vec3 = [-1.88, 0.4, 0];
export const PACK_CENTER: Vec3 = [-0.2, 0.24, 0];

export const GLYCOL = {
  radiator: [
    [1.68, 0.52, 0.08],
    [1.9, 0.68, 0.08],
    [2.08, 0.78, 0],
    [2.08, 0.4, 0],
    [1.86, 0.4, -0.02],
    [1.68, 0.44, 0.08],
  ],
  pack: [
    [1.68, 0.44, 0.08],
    [1.25, 0.3, 0.68],
    [0.15, 0.24, 0.7],
    [-1.15, 0.24, 0.68],
    [-1.7, 0.32, 0.2],
    [-1.15, 0.24, -0.68],
    [0.15, 0.24, -0.7],
    [1.25, 0.3, -0.5],
    [1.68, 0.5, 0.08],
  ],
  powertrain: [
    [1.68, 0.46, 0.08],
    [1.05, 0.36, -0.28],
    [FRONT_X, 0.36, -0.22],
    [0.1, 0.32, -0.48],
    [REAR_X, 0.42, -0.28],
    [REAR_X, 0.34, 0.22],
    [0.35, 0.3, 0.4],
    [1.68, 0.42, 0.08],
  ],
  cabin: [
    [1.68, 0.54, 0.08],
    [1.2, 0.72, -0.05],
    [0.72, 0.9, -0.12],
    [0.95, 0.7, 0.18],
    [1.68, 0.48, 0.08],
  ],
  computer: [
    [1.68, 0.5, 0.08],
    [1.35, 0.62, -0.22],
    [0.95, 0.74, -0.4],
    [0.78, 0.78, -0.48],
    [1.15, 0.58, -0.22],
    [1.68, 0.46, 0.08],
  ],
} as const satisfies Record<string, readonly Vec3[]>;
