import assert from "node:assert/strict";
import { test } from "node:test";
import {
  BODY_PAINT,
  CABIN_COLORS,
  CABIN_SURFACE_NAMES,
  EXTERIOR_PAINT_TARGETS,
  GLASS_SURFACES,
  isCabinSurface,
  isExteriorPaintTarget,
  isGlassSurface,
} from "../src/scene/paint.ts";

const CABIN_MESHES = [
  ...CABIN_SURFACE_NAMES,
  "charge-pad-driver",
  "charge-pad-passenger",
  "charge-pad-well-driver",
  "charge-pad-well-passenger",
  "footwell-driver",
  "footwell-passenger",
  "seat-driver",
  "seat-passenger",
  "seat-rear",
  "door-panel-driver",
  "door-panel-passenger",
];

test("body paint is an allowlist of exterior panels", () => {
  for (const name of EXTERIOR_PAINT_TARGETS) {
    assert.equal(isExteriorPaintTarget(name), true, name);
    assert.equal(isCabinSurface(name), false, name);
    assert.equal(isGlassSurface(name), false, name);
  }
});

test("cabin meshes and glass never take body paint", () => {
  for (const name of CABIN_MESHES) {
    assert.equal(isCabinSurface(name), true, name);
    assert.equal(isExteriorPaintTarget(name), false, name);
    assert.equal(isGlassSurface(name), false, name);
  }
  for (const name of GLASS_SURFACES) {
    assert.equal(isGlassSurface(name), true, name);
    assert.equal(isExteriorPaintTarget(name), false, name);
    assert.equal(isCabinSurface(name), false, name);
  }
  for (const name of ["steering-wheel", "display", "headlamp", "wheel"]) {
    assert.equal(isExteriorPaintTarget(name), false, name);
  }
});

test("cabin colors are interior tones, not the body paint", () => {
  for (const [key, color] of Object.entries(CABIN_COLORS)) {
    assert.notEqual(color.toLowerCase(), BODY_PAINT.toLowerCase(), key);
  }
});
