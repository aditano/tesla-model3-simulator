import * as THREE from "three";
import { FRONT_X, REAR_X, WHEEL_R } from "./layout";

type Key = {
  x: number;
  w: number;
  y0: number;
  y1: number;
  n: number;
  tumble: number;
};

type Pt = { z: number; y: number; sharp?: boolean };

const BODY_KEYS: Key[] = [
  { x: 2.3, w: 0.18, y0: 0.32, y1: 0.46, n: 2, tumble: 0.04 },
  { x: 2.08, w: 0.7, y0: 0.18, y1: 0.58, n: 2, tumble: 0.05 },
  { x: 1.78, w: 0.9, y0: 0.15, y1: 0.7, n: 2, tumble: 0.06 },
  { x: 1.4, w: 0.95, y0: 0.14, y1: 0.78, n: 2, tumble: 0.07 },
  { x: 1.02, w: 0.95, y0: 0.14, y1: 0.9, n: 2, tumble: 0.1 },
  { x: 0.4, w: 0.955, y0: 0.14, y1: 0.96, n: 2, tumble: 0.12 },
  { x: -0.45, w: 0.955, y0: 0.14, y1: 0.96, n: 2, tumble: 0.12 },
  { x: -1.15, w: 0.94, y0: 0.15, y1: 0.9, n: 2, tumble: 0.1 },
  { x: -1.58, w: 0.9, y0: 0.16, y1: 0.8, n: 2, tumble: 0.08 },
  { x: -1.98, w: 0.8, y0: 0.18, y1: 0.66, n: 2, tumble: 0.05 },
  { x: -2.28, w: 0.48, y0: 0.26, y1: 0.52, n: 2, tumble: 0.03 },
  { x: -2.46, w: 0.16, y0: 0.34, y1: 0.44, n: 2, tumble: 0.02 },
];

const GLASS_KEYS: Key[] = [
  { x: 0.98, w: 0.7, y0: 0.88, y1: 0.98, n: 2, tumble: 0.08 },
  { x: 0.62, w: 0.68, y0: 0.98, y1: 1.28, n: 2, tumble: 0.16 },
  { x: 0.12, w: 0.64, y0: 1.08, y1: 1.45, n: 2, tumble: 0.2 },
  { x: -0.42, w: 0.62, y0: 1.06, y1: 1.44, n: 2, tumble: 0.2 },
  { x: -0.92, w: 0.56, y0: 0.96, y1: 1.22, n: 2, tumble: 0.16 },
  { x: -1.38, w: 0.4, y0: 0.84, y1: 0.96, n: 2, tumble: 0.1 },
];

function sampleKeys(keys: readonly Key[], count: number): Key[] {
  const sorted = [...keys].sort((a, b) => a.x - b.x);
  const out: Key[] = [];
  for (let i = 0; i < count; i += 1) {
    const x = THREE.MathUtils.lerp(sorted[0].x, sorted[sorted.length - 1].x, i / (count - 1));
    let index = 0;
    while (index < sorted.length - 2 && sorted[index + 1].x < x) index += 1;
    const a = sorted[index];
    const b = sorted[index + 1];
    const span = b.x - a.x || 1;
    const t = THREE.MathUtils.smoothstep((x - a.x) / span, 0, 1);
    out.push({
      x,
      w: THREE.MathUtils.lerp(a.w, b.w, t),
      y0: THREE.MathUtils.lerp(a.y0, b.y0, t),
      y1: THREE.MathUtils.lerp(a.y1, b.y1, t),
      n: THREE.MathUtils.lerp(a.n, b.n, t),
      tumble: THREE.MathUtils.lerp(a.tumble, b.tumble, t),
    });
  }
  return out;
}

function filletOpen(corners: readonly Pt[], radius: number, steps: number): Pt[] {
  const out: Pt[] = [];
  const push = (z: number, y: number, sharp = false) => {
    const last = out[out.length - 1];
    if (last && Math.hypot(last.z - z, last.y - y) < 1e-5) return;
    out.push({ z, y, sharp });
  };
  push(corners[0].z, corners[0].y, corners[0].sharp);
  for (let i = 1; i < corners.length - 1; i += 1) {
    const prev = corners[i - 1];
    const curr = corners[i];
    const next = corners[i + 1];
    if (curr.sharp) {
      push(curr.z, curr.y, true);
      continue;
    }
    const d1 = Math.hypot(prev.z - curr.z, prev.y - curr.y) || 1;
    const d2 = Math.hypot(next.z - curr.z, next.y - curr.y) || 1;
    const len = Math.min(radius, d1 * 0.46, d2 * 0.46);
    const az = curr.z + ((prev.z - curr.z) / d1) * len;
    const ay = curr.y + ((prev.y - curr.y) / d1) * len;
    const bz = curr.z + ((next.z - curr.z) / d2) * len;
    const by = curr.y + ((next.y - curr.y) / d2) * len;
    for (let s = 0; s <= steps; s += 1) {
      const t = s / steps;
      const u = 1 - t;
      push(u * u * az + 2 * u * t * curr.z + t * t * bz, u * u * ay + 2 * u * t * curr.y + t * t * by);
    }
  }
  const last = corners[corners.length - 1];
  push(last.z, last.y, last.sharp);
  return out;
}

function applyArch(x: number, y: number, z: number, top: number): { y: number; z: number } {
  if (y > top - 0.025) return { y, z };
  const outer = THREE.MathUtils.smoothstep(Math.abs(z), 0.5, 0.82);
  if (outer <= 0) return { y, z };
  const archR = WHEEL_R + 0.12;
  let lifted = y;
  let lip = 0;
  for (const axle of [FRONT_X, REAR_X]) {
    const dx = Math.abs(x - axle);
    if (dx >= archR) continue;
    const yArch = WHEEL_R + Math.sqrt(archR * archR - dx * dx);
    if (y < yArch) lifted = Math.max(lifted, THREE.MathUtils.lerp(y, yArch, outer));
    lip = Math.max(lip, 1 - Math.min(1, Math.abs(Math.max(y, yArch) - yArch) / 0.045));
  }
  const flare = 1 + lip * outer * 0.02;
  return { y: lifted, z: z * flare };
}

function bodyHalf(st: Key): Pt[] {
  const shoulderY = THREE.MathUtils.lerp(st.y0, st.y1, 0.56);
  const beltZ = st.w * (1 - st.tumble);
  const crown = 0.022 * THREE.MathUtils.smoothstep(st.w, 0.25, 0.75);
  return filletOpen(
    [
      { z: 0, y: st.y1 + crown },
      { z: beltZ * 0.58, y: st.y1 + crown * 0.15 },
      { z: beltZ, y: st.y1 },
      { z: st.w, y: shoulderY, sharp: true },
      { z: st.w * 0.985, y: THREE.MathUtils.lerp(st.y0, shoulderY, 0.22) },
      { z: st.w * 0.7, y: st.y0 + 0.02 },
      { z: st.w * 0.28, y: st.y0 - 0.012 },
      { z: 0, y: st.y0 },
    ],
    0.05,
    3,
  );
}

function glassHalf(st: Key): Pt[] {
  const roofZ = st.w * (1 - st.tumble);
  return filletOpen(
    [
      { z: 0, y: st.y1 },
      { z: roofZ, y: st.y1 },
      { z: st.w, y: THREE.MathUtils.lerp(st.y0, st.y1, 0.2) },
      { z: 0, y: st.y0 },
    ],
    0.07,
    4,
  );
}

function ringAt(st: Key, kind: "body" | "glass"): THREE.Vector3[] {
  const half = kind === "body" ? bodyHalf(st) : glassHalf(st);
  const points: THREE.Vector3[] = [];
  const emit = (z: number, y: number, sharp = false) => {
    const shaped = kind === "body" ? applyArch(st.x, y, z, st.y1) : { y, z };
    const point = new THREE.Vector3(st.x, shaped.y, shaped.z);
    points.push(point);
    if (sharp) points.push(point.clone());
  };
  for (let i = 0; i < half.length - 1; i += 1) emit(half[i].z, half[i].y, half[i].sharp);
  for (let i = half.length - 1; i >= 1; i -= 1) emit(-half[i].z, half[i].y, half[i].sharp);
  return points;
}

function loft(keys: readonly Key[], kind: "body" | "glass"): THREE.BufferGeometry {
  const samples = sampleKeys(keys, kind === "body" ? 88 : 48);
  const first = ringAt(samples[0], kind);
  const rings = first.length;
  const positions: number[] = [];
  const indices: number[] = [];
  const nose = samples[0];
  const tail = samples[samples.length - 1];
  positions.push(nose.x, (nose.y0 + nose.y1) / 2, 0);

  for (const st of samples) {
    const ring = ringAt(st, kind);
    if (ring.length !== rings) {
      throw new Error(`Cross-section changed length at x=${st.x}`);
    }
    for (const point of ring) positions.push(point.x, point.y, point.z);
  }
  positions.push(tail.x, (tail.y0 + tail.y1) / 2, 0);

  const vertex = (station: number, i: number) => 1 + station * rings + i;
  for (let i = 0; i < rings; i += 1) {
    indices.push(0, vertex(0, i), vertex(0, (i + 1) % rings));
  }
  for (let station = 0; station < samples.length - 1; station += 1) {
    for (let i = 0; i < rings; i += 1) {
      const next = (i + 1) % rings;
      const a = vertex(station, i);
      const b = vertex(station, next);
      const c = vertex(station + 1, i);
      const d = vertex(station + 1, next);
      indices.push(a, c, b, b, c, d);
    }
  }
  const tailIndex = 1 + samples.length * rings;
  const last = samples.length - 1;
  for (let i = 0; i < rings; i += 1) {
    indices.push(tailIndex, vertex(last, (i + 1) % rings), vertex(last, i));
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  const position = geometry.attributes.position;
  const normal = geometry.attributes.normal;
  let score = 0;
  for (let i = 0; i < position.count; i += 1) {
    const z = position.getZ(i);
    if (Math.abs(z) < 0.2) continue;
    score += Math.sign(z) * normal.getZ(i);
  }
  if (score < 0 && geometry.index) {
    const index = geometry.index;
    for (let i = 0; i < index.count; i += 3) {
      const swap = index.getX(i);
      index.setX(i, index.getX(i + 2));
      index.setX(i + 2, swap);
    }
    geometry.computeVertexNormals();
  }
  geometry.computeBoundingSphere();
  return geometry;
}

export function createBodyGeometry(): THREE.BufferGeometry {
  return loft(BODY_KEYS, "body");
}

export function createGlassGeometry(): THREE.BufferGeometry {
  return loft(GLASS_KEYS, "glass");
}
