import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import type { Mode, ValveId } from "../model";
import { emphasis, valveIndex } from "../model";
import { damp } from "./damp";
import { FlowTube } from "./flow";
import { GLYCOL, OCTOVALVE, RADIATOR } from "./layout";
import { Tag } from "./tags";

function gains(valve: ValveId): { radiator: number; pack: number; powertrain: number; cabin: number; computer: number; reverse: boolean } {
  switch (valve) {
    case "shed":
      return { radiator: 1, pack: 0.95, powertrain: 0.9, cabin: 0.12, computer: 0.35, reverse: false };
    case "scavenge":
      return { radiator: 0.12, pack: 1, powertrain: 1, cabin: 0.12, computer: 0.28, reverse: false };
    case "cabin":
      return { radiator: 0.28, pack: 0.4, powertrain: 0.35, cabin: 1, computer: 0.3, reverse: false };
    case "charge":
      return { radiator: 0.1, pack: 1, powertrain: 0.08, cabin: 0.16, computer: 0.22, reverse: true };
    default: {
      const neverValve: never = valve;
      return neverValve;
    }
  }
}

export function Cooling({ mode, valve, assist, onSelect }: { mode: Mode; valve: ValveId; assist: number; onSelect: () => void }) {
  const stem = useRef<THREE.Group>(null);
  const angle = useRef(0);
  const glow = useRef(0);
  const target = emphasis(mode, "cooling");
  const route = gains(valve);
  const sign = route.reverse ? -1 : 1;
  const showTags = mode === "cooling";
  const computerGain = mode === "computers" ? 0.25 + assist * 0.75 : route.computer * (mode === "cooling" || mode === "inside" ? 1 : 0.2);

  useFrame((_, dt) => {
    glow.current = damp(glow.current, target, dt, 5);
    const next = valveIndex(valve) * (Math.PI / 2);
    angle.current = damp(angle.current, next, dt, 6);
    if (stem.current) stem.current.rotation.y = angle.current;
  });

  const pick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    onSelect();
  };

  const visible = mode !== "overview" && mode !== "motor" && mode !== "battery" ? 1 : mode === "overview" ? 0 : 0.35;
  if (mode === "overview") return null;

  const loopGain = (value: number) => value * (mode === "cooling" ? 1 : mode === "inside" ? 0.45 : 0.2) * Math.max(visible, glow.current);

  return (
    <group>
      <group position={OCTOVALVE} onClick={pick}>
        <mesh>
          <cylinderGeometry args={[0.09, 0.09, 0.16, 24]} />
          <meshPhysicalMaterial
            color="#d5dde6"
            metalness={0.45}
            roughness={0.2}
            transparent
            opacity={mode === "cooling" ? 0.28 : 0.8}
            transmission={mode === "cooling" ? 0.8 : 0}
          />
        </mesh>
        <group ref={stem}>
          <mesh>
            <cylinderGeometry args={[0.045, 0.045, 0.12, 16]} />
            <meshStandardMaterial color="#8fd4ff" emissive="#9fd7ff" emissiveIntensity={1.2} toneMapped={false} />
          </mesh>
          {[0, 1, 2, 3].map((port) => (
            <mesh key={port} position={[0.07, 0.03, (port - 1.5) * 0.035]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.012, 0.012, 0.06, 8]} />
              <meshStandardMaterial color="#c5d0dc" metalness={0.6} roughness={0.3} />
            </mesh>
          ))}
          {[0, 1, 2, 3].map((port) => (
            <mesh key={`low-${port}`} position={[0.07, -0.03, (port - 1.5) * 0.035]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.012, 0.012, 0.06, 8]} />
              <meshStandardMaterial color="#c5d0dc" metalness={0.6} roughness={0.3} />
            </mesh>
          ))}
        </group>
        <mesh position={[0, -0.12, 0]}>
          <boxGeometry args={[0.28, 0.06, 0.22]} />
          <meshStandardMaterial color="#aeb6c0" metalness={0.75} roughness={0.28} />
        </mesh>
        {(showTags || mode === "inside") && (
          <Tag position={[0, 0.24, 0]} active={mode === "cooling"} onClick={onSelect}>
            Octovalve
          </Tag>
        )}
        {showTags ? <Tag position={[0, -0.22, 0]}>Supermanifold</Tag> : null}
      </group>

      <mesh position={RADIATOR} onClick={pick}>
        <boxGeometry args={[0.06, 0.42, 1.05]} />
        <meshStandardMaterial color="#9aa8b5" emissive="#b7d4ea" emissiveIntensity={route.radiator * 0.5} metalness={0.55} roughness={0.35} />
      </mesh>
      {showTags ? <Tag position={[RADIATOR[0], RADIATOR[1] + 0.32, 0]}>Radiator</Tag> : null}

      <mesh position={[0.78, 0.9, -0.12]}>
        <boxGeometry args={[0.28, 0.1, 0.22]} />
        <meshStandardMaterial
          color="#c9d4df"
          emissive="#f2d7b0"
          emissiveIntensity={route.cabin}
          metalness={0.3}
          roughness={0.4}
          transparent
          opacity={0.45 + route.cabin * 0.55}
        />
      </mesh>
      {showTags ? <Tag position={[0.78, 1.05, -0.12]}>Cabin heat</Tag> : null}

      <FlowTube points={GLYCOL.radiator} color="#9fd4ff" speed={0.55 * sign} gain={loopGain(route.radiator)} radius={0.012} />
      <FlowTube points={GLYCOL.pack} color="#8ecfff" speed={0.4 * sign} gain={loopGain(route.pack)} radius={0.011} />
      <FlowTube points={GLYCOL.powertrain} color="#b7e3ff" speed={0.42 * sign} gain={loopGain(route.powertrain)} radius={0.01} />
      <FlowTube points={GLYCOL.cabin} color="#f0d7b2" speed={0.36 * sign} gain={loopGain(route.cabin)} radius={0.01} />
      <FlowTube points={GLYCOL.computer} color="#d5c8ff" speed={0.3} gain={computerGain} radius={0.008} />
    </group>
  );
}
