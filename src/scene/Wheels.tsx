import { useRef, type MutableRefObject } from "react";
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
  useFrame(() => {
    if (driven && ref.current && spin) {
      ref.current.rotation.z = spin.current.wheel;
    }
  });
  const side = Math.sign(z) || 1;
  return (
    <group ref={ref} position={[x, WHEEL_R, z]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[WHEEL_R, WHEEL_R, 0.23, 36]} />
        <meshStandardMaterial color="#16181c" roughness={0.72} metalness={0.05} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, side * 0.07, 0]}>
        <cylinderGeometry args={[0.24, 0.24, 0.045, 36]} />
        <meshStandardMaterial color="#e6e3db" metalness={0.85} roughness={0.22} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, side * 0.095, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.03, 20]} />
        <meshStandardMaterial color="#2a2d33" metalness={0.7} roughness={0.3} />
      </mesh>
    </group>
  );
}
