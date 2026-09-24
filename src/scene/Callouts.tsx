import { Html } from "@react-three/drei";
import type { Mode } from "../model";
import { isOpen } from "../model";
import { COMPUTER, OCTOVALVE, PENTHOUSE, REAR_X } from "./layout";

const MARKS: { id: Mode; label: string; position: [number, number, number] }[] = [
  { id: "motor", label: "Rear motor", position: [REAR_X, 0.82, 0.46] },
  { id: "battery", label: "2170 pack", position: [0.2, 0.58, 0.82] },
  { id: "cooling", label: "Octovalve", position: [OCTOVALVE[0], OCTOVALVE[1] + 0.32, OCTOVALVE[2] + 0.28] },
  { id: "penthouse", label: "Penthouse", position: [PENTHOUSE[0], PENTHOUSE[1] + 0.34, PENTHOUSE[2] + 0.42] },
  { id: "computers", label: "Computer", position: [COMPUTER[0], COMPUTER[1] + 0.28, COMPUTER[2]] },
];

export function Callouts({ mode, onSelect }: { mode: Mode; onSelect: (mode: Mode) => void }) {
  if (!isOpen(mode)) return null;
  return (
    <group>
      {MARKS.map((mark) => {
        const active = mode === mark.id;
        return (
          <group key={mark.id} position={mark.position}>
            <mesh raycast={() => undefined}>
              <sphereGeometry args={[0.015, 12, 12]} />
              <meshBasicMaterial color={active ? "#f4f1ea" : "#9fd4ff"} toneMapped={false} />
            </mesh>
            <Html
              position={[0, 0.1, 0]}
              center
              distanceFactor={7.2}
              zIndexRange={[12, 0]}
              wrapperClass="tag-wrap"
            >
              <button type="button" className={active ? "tag on" : "tag"} onClick={() => onSelect(mark.id)}>
                {mark.label}
              </button>
            </Html>
          </group>
        );
      })}
    </group>
  );
}
