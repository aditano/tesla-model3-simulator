import * as THREE from "three";
import { FRONT_X, REAR_X, WHEEL_R } from "./layout";

/**
 * Original schematic shell. Proportions follow the published Model 3 envelope
 * (wheelbase 2.875 m, length about 4.69 m, width about 1.85 m, height about 1.44 m).
 * It is not a factory surface and not a scanned mesh.
 */

const TIP = 2.28;
const TAIL = -2.46;
const COWL = 0.98;
const DECK = -1.4;
const ROCKER = 0.16;

type Key = { x: number; v: number };
type Pt = { y: number; z: number; glass: boolean };

const CROWN: readonly Key[] = [
  { x: TAIL, v: 0.58 },
  { x: -2.2, v: 0.74 },
  { x: -1.85, v: 0.92 },
  { x: -1.48, v: 1.02 },
  { x: -1.12, v: 1.16 },
  { x: -0.72, v: 1.34 },
  { x: -0.28, v: 1.43 },
  { x: 0.12, v: 1.4 },
  { x: 0.48, v: 1.26 },
  { x: COWL, v: 1.02 },
  { x: 1.28, v: 0.9 },
  { x: 1.62, v: 0.74 },
  { x: 1.95, v: 0.62 },
  { x: TIP, v: 0.52 },
];

const HIP: readonly Key[] = [
  { x: TAIL, v: 0.46 },
  { x: -2.22, v: 0.7 },
  { x: -1.82, v: 0.84 },
  { x: -1.35, v: 0.91 },
  { x: -0.55, v: 0.94 },
  { x: 0.25, v: 0.935 },
  { x: 1.05, v: 0.925 },
  { x: 1.55, v: 0.9 },
  { x: 1.95, v: 0.78 },
  { x: TIP, v: 0.5 },
];

const BELT: readonly Key[] = [
  { x: TAIL, v: 0.56 },
  { x: -1.7, v: 0.94 },
  { x: -1.15, v: 1.05 },
  { x: -0.2, v: 1.0 },
  { x: 0.55, v: 0.98 },
  { x: COWL, v: 1.0 },
  { x: 1.35, v: 0.88 },
  { x: 1.75, v: 0.7 },
  { x: TIP, v: 0.5 },
];

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function sample(keys: readonly Key[], x: number): number {
  if (x <= keys[0].x) return keys[0].v;
  const last = keys[keys.length - 1];
  if (x >= last.x) return last.v;
  let index = 0;
  while (keys[index + 1].x < x) index += 1;
  const a = keys[index];
  const b = keys[index + 1];
  const span = b.x - a.x || 1;
  const t = (x - a.x) / span;
  const p0 = keys[Math.max(0, index - 1)].v;
  const p3 = keys[Math.min(keys.length - 1, index + 2)].v;
  const t2 = t * t;
  const t3 = t2 * t;
  return (
    0.5 *
    (2 * a.v +
      (-p0 + b.v) * t +
      (2 * p0 - 5 * a.v + 4 * b.v - p3) * t2 +
      (-p0 + 3 * a.v - 3 * b.v + p3) * t3)
  );
}

function outerLip(x: number): number {
  const gap = 0.06;
  const blend = 0.16;
  let lip = ROCKER;
  for (const axle of [FRONT_X, REAR_X]) {
    const dx = Math.abs(x - axle);
    const limit = WHEEL_R + gap;
    if (dx >= limit + blend) continue;
    if (dx <= limit) {
      lip = Math.max(lip, WHEEL_R + Math.sqrt(limit * limit - dx * dx));
      continue;
    }
    const u = (dx - limit) / blend;
    const s = u * u * (3 - 2 * u);
    lip = Math.max(lip, lerp(WHEEL_R, ROCKER, s));
  }
  return lip;
}

function endShape(x: number): { zScale: number; yMix: number; yAnchor: number } {
  if (x > 2.0) {
    const u = THREE.MathUtils.clamp((x - 2.0) / (TIP - 2.0), 0, 1);
    return { zScale: Math.sqrt(Math.max(0, 1 - u * u)), yMix: u * u, yAnchor: 0.55 };
  }
  if (x < -2.18) {
    const u = THREE.MathUtils.clamp((-2.18 - x) / (-2.18 - TAIL), 0, 1);
    return { zScale: Math.sqrt(Math.max(0, 1 - u * u)), yMix: u * u, yAnchor: 0.68 };
  }
  return { zScale: 1, yMix: 0, yAnchor: 0 };
}

function halfSection(x: number): Pt[] {
  const shape = endShape(x);
  const crown = sample(CROWN, x);
  const hipZ = sample(HIP, x) * shape.zScale;
  const beltY = lerp(sample(BELT, x), shape.yAnchor, shape.yMix);
  const crownY = lerp(crown, shape.yAnchor, shape.yMix * 0.85);
  const aheadOfDeck = THREE.MathUtils.smoothstep(x, DECK - 0.06, DECK + 0.1);
  const behindCowl = 1 - THREE.MathUtils.smoothstep(x, COWL - 0.1, COWL + 0.06);
  const cabin = aheadOfDeck * behindCowl;
  const topZ = hipZ * lerp(0.62, 0.55, cabin);
  const beltZ = hipZ * lerp(0.78, 0.9, cabin);
  const sillZ = hipZ * 0.84;
  const lip = outerLip(x);
  const pts: Pt[] = [];

  for (let i = 0; i <= 7; i += 1) {
    const t = i / 7;
    const s = t * t * (3 - 2 * t);
    const z = lerp(0, lerp(topZ, beltZ, s), Math.sin(s * Math.PI * 0.5));
    const y = lerp(crownY, beltY, s);
    pts.push({ y, z, glass: cabin > 0.45 });
  }

  for (let i = 1; i <= 6; i += 1) {
    const t = i / 6;
    const yNatural = lerp(beltY, ROCKER, t * t * (3 - 2 * t));
    let z = hipZ;
    if (t < 0.22) {
      z = lerp(beltZ, hipZ, Math.sin((t / 0.22) * Math.PI * 0.5));
    } else if (t > 0.78) {
      z = lerp(hipZ, sillZ, (t - 0.78) / 0.22);
    }
    const outer = THREE.MathUtils.smoothstep(z, hipZ * 0.62, hipZ * 0.9);
    const y = lerp(yNatural, Math.max(yNatural, lip), outer);
    const flare = 1 + outer * THREE.MathUtils.smoothstep(lip, ROCKER + 0.08, ROCKER + 0.4) * 0.015;
    pts.push({ y, z: z * flare, glass: false });
  }

  const sillY = pts[pts.length - 1]?.y ?? ROCKER;
  for (let i = 1; i <= 5; i += 1) {
    const t = i / 5;
    const s = t * t * (3 - 2 * t);
    pts.push({
      y: lerp(sillY, ROCKER * 0.92, s),
      z: lerp(sillZ, 0, s),
      glass: false,
    });
  }

  return pts;
}

type Built = { body: THREE.BufferGeometry; glass: THREE.BufferGeometry };

function build(): Built {
  const xs: number[] = [];
  for (let x = TIP; x >= TAIL; x -= 0.04) xs.push(Number(x.toFixed(4)));
  if (xs[xs.length - 1] !== TAIL) xs.push(TAIL);

  const rings: Pt[][] = [];
  const stationX: number[] = [];
  for (const x of xs) {
    if (endShape(x).zScale < 0.07) continue;
    const half = halfSection(x);
    const ring: Pt[] = [];
    for (let i = 0; i < half.length - 1; i += 1) ring.push({ ...half[i], z: half[i].z });
    for (let i = half.length - 1; i >= 1; i -= 1) ring.push({ ...half[i], z: -half[i].z });
    rings.push(ring);
    stationX.push(x);
  }

  const ringsN = rings[0]?.length ?? 0;
  if (rings.some((ring) => ring.length !== ringsN)) {
    throw new Error("Body cross-section changed length");
  }

  const positions: number[] = [];
  const glassFlags: boolean[] = [];
  const nose = endShape(TIP);
  positions.push(TIP, nose.yAnchor, 0);
  glassFlags.push(false);
  for (let s = 0; s < rings.length; s += 1) {
    const ring = rings[s];
    const x = stationX[s] ?? 0;
    for (const point of ring) {
      positions.push(x, point.y, point.z);
      glassFlags.push(point.glass);
    }
  }
  const tail = endShape(TAIL);
  positions.push(TAIL, tail.yAnchor, 0);
  glassFlags.push(false);

  const indices: number[] = [];
  const vertex = (station: number, i: number) => 1 + station * ringsN + i;
  for (let i = 0; i < ringsN; i += 1) {
    indices.push(0, vertex(0, i), vertex(0, (i + 1) % ringsN));
  }
  for (let station = 0; station < rings.length - 1; station += 1) {
    for (let i = 0; i < ringsN; i += 1) {
      const next = (i + 1) % ringsN;
      const a = vertex(station, i);
      const b = vertex(station, next);
      const c = vertex(station + 1, i);
      const d = vertex(station + 1, next);
      indices.push(a, c, b, b, c, d);
    }
  }
  const tailIndex = 1 + rings.length * ringsN;
  const last = rings.length - 1;
  for (let i = 0; i < ringsN; i += 1) {
    indices.push(tailIndex, vertex(last, (i + 1) % ringsN), vertex(last, i));
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

  return {
    body: take(geometry, glassFlags, false),
    glass: take(geometry, glassFlags, true),
  };
}

function take(source: THREE.BufferGeometry, glassFlags: readonly boolean[], wantGlass: boolean): THREE.BufferGeometry {
  const srcPos = source.attributes.position;
  const srcNor = source.attributes.normal;
  const srcIndex = source.index;
  if (!srcIndex || !srcNor) throw new Error("Body mesh is missing index or normals");
  const map = new Map<number, number>();
  const positions: number[] = [];
  const normals: number[] = [];
  const indices: number[] = [];

  const use = (index: number) => {
    const existing = map.get(index);
    if (existing !== undefined) return existing;
    const next = positions.length / 3;
    map.set(index, next);
    positions.push(srcPos.getX(index), srcPos.getY(index), srcPos.getZ(index));
    normals.push(srcNor.getX(index), srcNor.getY(index), srcNor.getZ(index));
    return next;
  };

  for (let i = 0; i < srcIndex.count; i += 3) {
    const a = srcIndex.getX(i);
    const b = srcIndex.getY(i);
    const c = srcIndex.getZ(i);
    const glassCount = Number(glassFlags[a]) + Number(glassFlags[b]) + Number(glassFlags[c]);
    const isGlass = glassCount === 3;
    if (isGlass !== wantGlass) continue;
    indices.push(use(a), use(b), use(c));
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
  geometry.setIndex(indices);
  geometry.computeBoundingSphere();
  return geometry;
}

let cache: Built | null = null;

function surfaces(): Built {
  if (!cache) cache = build();
  return cache;
}

export function createBodyGeometry(): THREE.BufferGeometry {
  return surfaces().body;
}

export function createGlassGeometry(): THREE.BufferGeometry {
  return surfaces().glass;
}
