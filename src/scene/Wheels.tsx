import { useMemo, useRef, type MutableRefObject } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import { FRONT_X, HALF_TRACK, REAR_X, WHEEL_R } from "./layout";

export function Wheels({ spin }: { spin: MutableRefObject<{ wheel: number }> }) {
  return (
    <group>
      <Wheel x={FRONT_X} z={HALF_TRACK} />
      <Wheel x={FRONT_X} z={-HALF_TRACK} />
      <Wheel x={REAR_X} z={HALF_TRACK} driven spin={spin} />
      <Wheel x={REAR_X} z={-HALF_TRACK} driven spin={spin} />
    </group>
  );
}

function Wheel({
  x,
  z,
  driven = false,
  spin,
}: {
  x: number;
  z: number;
  driven?: boolean;
  spin?: MutableRefObject<{ wheel: number }>;
}) {
  const ref = useRef<Group>(null);
  const inserts = useMemo(() => Array.from({ length: 5 }, (_, index) => (index / 5) * Math.PI * 2), []);
  useFrame(() => {
    if (driven && ref.current && spin) ref.current.rotation.z = spin.current.wheel;
  });
  const side = Math.sign(z) || 1;
  return (
    <group ref={ref} position={[x, WHEEL_R, z]}>
      <mesh rotation={[Math.PI / 2, 0, 0]} raycast={() => undefined}>
        <cylinderGeometry args={[WHEEL_R, WHEEL_R, 0.22, 48]} />
        <meshStandardMaterial color="#121316" roughness={0.88} metalness={0.02} />
      </mesh>
      <mesh raycast={() => undefined}>
        <torusGeometry args={[WHEEL_R - 0.012, 0.036, 12, 48]} />
        <meshStandardMaterial color="#1c1e22" roughness={0.75} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, side * 0.1]} raycast={() => undefined}>
        <cylinderGeometry args={[0.248, 0.248, 0.016, 64]} />
        <meshPhysicalMaterial color="#e7e3da" metalness={0.92} roughness={0.16} clearcoat={0.4} clearcoatRoughness={0.2} />
      </mesh>
      <mesh position={[0, 0, side * 0.1]} raycast={() => undefined}>
        <torusGeometry args={[0.246, 0.008, 8, 48]} />
        <meshStandardMaterial color="#f7f4ee" metalness={0.88} roughness={0.14} />
      </mesh>
      {inserts.map((angle) => (
        <mesh
          key={angle}
          position={[Math.cos(angle) * 0.132, Math.sin(angle) * 0.132, side * 0.112]}
          rotation={[0, 0, angle + 0.55]}
          raycast={() => undefined}
        >
          <boxGeometry args={[0.1, 0.03, 0.006]} />
          <meshStandardMaterial color="#16181c" metalness={0.25} roughness={0.5} />
        </mesh>
      ))}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, side * 0.114]} raycast={() => undefined}>
        <cylinderGeometry args={[0.046, 0.046, 0.01, 32]} />
        <meshStandardMaterial color="#c8ccd2" metalness={0.86} roughness={0.18} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, side * 0.121]} raycast={() => undefined}>
        <cylinderGeometry args={[0.016, 0.016, 0.008, 20]} />
        <meshStandardMaterial color="#2a2d32" metalness={0.7} roughness={0.3} />
      </mesh>
    </group>
  );
}
