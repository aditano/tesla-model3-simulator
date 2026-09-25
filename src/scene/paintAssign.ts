import * as THREE from "three";
import { isExteriorPaintTarget } from "./paint";

/** Apply body paint only to allowlisted exterior panels. Other meshes are left alone. */
export function assignExteriorPaint(
  root: THREE.Object3D,
  paintFor: (name: string) => THREE.Material | null,
): void {
  root.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;
    const next = paintFor(object.name);
    if (!next) return;
    object.material = next;
  });
}

/** If body paint landed on a cabin or hardware mesh, replace it. */
export function stripBodyPaintFromInterior(
  root: THREE.Object3D,
  bodyPaint: ReadonlySet<THREE.Material>,
  fallback: THREE.Material,
): void {
  root.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;
    if (isExteriorPaintTarget(object.name)) return;
    const current = object.material;
    const list = Array.isArray(current) ? current : [current];
    if (list.some((material) => bodyPaint.has(material))) {
      object.material = fallback;
    }
  });
}
