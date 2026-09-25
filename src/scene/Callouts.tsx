import { Html } from "@react-three/drei";
import type { Mode } from "../model";
import { COMPUTER, OCTOVALVE, PENTHOUSE, REAR_X } from "./layout";

const MARKS: { id: Mode; label: string; position: [number, number, number] }[] = [
  { id: "motor", label: "Rear motor", position: [REAR_X + 0.15, 1.12, 0.62] },
  { id: "penthouse", label: "Penthouse", position: [PENTHOUSE[0] - 0.05, 0.62, -0.62] },
  { id: "battery", label: "2170 pack", position: [-0.05, 0.36, 0.98] },
  { id: "computers", label: "Computer", position: [COMPUTER[0] - 0.15, 1.22, -0.05] },
  { id: "cooling", label: "Octovalve", position: [OCTOVALVE[0] + 0.05, 0.92, -0.28] },
];

export function Callouts({ mode, onSelect }: { mode: Mode; onSelect: (mode: Mode) => void }) {
  if (mode === "overview") return null;
  const marks = mode === "inside" ? MARKS : MARKS.filter((mark) => mark.id === mode);
  return (
    <group>
      {marks.map((mark) => {
        const active = mode === mark.id;
        return (
          <group key={mark.id} position={mark.position}>
            <mesh raycast={() => undefined}>
              <sphereGeometry args={[0.008, 10, 10]} />
              <meshBasicMaterial color={active ? "#f4f1ea" : "#9bb4c8"} />
            </mesh>
            <Html position={[0, 0.05, 0]} center distanceFactor={9} zIndexRange={[12, 0]} wrapperClass="tag-wrap">
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
