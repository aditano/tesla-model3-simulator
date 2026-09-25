import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import type { Mode, ValveId } from "../model";
import { emphasis, valveIndex } from "../model";
import { damp } from "./damp";
import { FlowTube } from "./flow";
import { GLYCOL, OCTOVALVE, RADIATOR } from "./layout";

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
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.1, 0]}>
          <torusGeometry args={[0.15, 0.016, 10, 48]} />
          <meshStandardMaterial color="#d5dde6" metalness={0.88} roughness={0.18} />
        </mesh>
        <mesh>
          <cylinderGeometry args={[0.16, 0.16, 0.24, 48]} />
          <meshPhysicalMaterial
            color="#e8eef5"
            metalness={0.12}
            roughness={0.04}
            transparent
            opacity={mode === "cooling" ? 0.38 : 0.88}
            transmission={mode === "cooling" ? 0.96 : 0.15}
            thickness={0.2}
            ior={1.45}
          />
        </mesh>
        {[0, 1, 2, 3].map((tick) => {
          const angle = (tick / 4) * Math.PI * 2;
          return (
            <mesh key={tick} position={[Math.cos(angle) * 0.15, 0.1, Math.sin(angle) * 0.15]}>
              <boxGeometry args={[0.018, 0.006, 0.008]} />
              <meshStandardMaterial color="#9aa3ad" metalness={0.7} roughness={0.28} />
            </mesh>
          );
        })}
        <group ref={stem}>
          <mesh>
            <cylinderGeometry args={[0.05, 0.05, 0.2, 24]} />
            <meshStandardMaterial color="#d5e9f6" emissive="#9fd4ff" emissiveIntensity={0.55} metalness={0.25} roughness={0.28} />
          </mesh>
          <mesh position={[0.09, 0.09, 0]}>
            <boxGeometry args={[0.045, 0.012, 0.012]} />
            <meshStandardMaterial color="#e7f3fb" emissive="#d5ecff" emissiveIntensity={0.4} />
          </mesh>
          {[0, 1, 2, 3].map((port) => {
            const angle = (port / 4) * Math.PI * 2;
            return (
              <mesh key={port} position={[Math.cos(angle) * 0.11, 0, Math.sin(angle) * 0.11]} rotation={[0, -angle, Math.PI / 2]}>
                <cylinderGeometry args={[0.022, 0.018, 0.15, 14]} />
                <meshStandardMaterial color="#d5e9f8" emissive="#9fd4ff" emissiveIntensity={mode === "cooling" ? 0.45 : 0.12} metalness={0.45} roughness={0.28} />
              </mesh>
            );
          })}
        </group>
        <mesh position={[0, -0.14, 0]}>
          <boxGeometry args={[0.32, 0.07, 0.24]} />
          <meshStandardMaterial color="#b7c0ca" metalness={0.8} roughness={0.22} />
        </mesh>
      </group>

      <mesh position={RADIATOR} onClick={pick}>
        <boxGeometry args={[0.06, 0.42, 1.05]} />
        <meshStandardMaterial color="#9aa8b5" emissive="#b7d4ea" emissiveIntensity={route.radiator * 0.5} metalness={0.55} roughness={0.35} />
      </mesh>

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
      <FlowTube points={GLYCOL.radiator} color="#b7e7ff" speed={0.55 * sign} gain={loopGain(route.radiator)} radius={0.028} />
      <FlowTube points={GLYCOL.pack} color="#9fd4ff" speed={0.4 * sign} gain={loopGain(route.pack)} radius={0.026} />
      <FlowTube points={GLYCOL.powertrain} color="#d2f0ff" speed={0.42 * sign} gain={loopGain(route.powertrain)} radius={0.022} />
      <FlowTube points={GLYCOL.cabin} color="#f3ddc0" speed={0.36 * sign} gain={loopGain(route.cabin)} radius={0.02} />
      <FlowTube points={GLYCOL.computer} color="#d5c8ff" speed={0.3} gain={computerGain} radius={0.012} />
    </group>
  );
}
