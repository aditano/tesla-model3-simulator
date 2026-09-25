import { useLayoutEffect, useMemo, useRef, type MutableRefObject } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Group } from "three";
import { FRONT_X, HALF_TRACK, REAR_X, WHEEL_R, readShot } from "./layout";

export function Wheels({ spin }: { spin: MutableRefObject<{ wheel: number }> }) {
  const root = useRef<Group>(null);
  const clip = useMemo(() => {
    if (readShot() !== "cabin") return [];
    return [new THREE.Plane(new THREE.Vector3(0, 0, 1), 0.02)];
  }, []);
  useLayoutEffect(() => {
    const group = root.current;
    if (!group || clip.length === 0) return;
    group.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      const materials = Array.isArray(object.material) ? object.material : [object.material];
      for (const material of materials) material.clippingPlanes = clip;
    });
  }, [clip]);
  return (
    <group ref={root}>
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
        <cylinderGeometry args={[WHEEL_R, WHEEL_R, 0.2, 64]} />
        <meshStandardMaterial color="#14161a" roughness={0.92} metalness={0.04} />
      </mesh>
      <mesh raycast={() => undefined}>
        <torusGeometry args={[WHEEL_R - 0.02, 0.028, 16, 64]} />
        <meshStandardMaterial color="#1a1c20" roughness={0.8} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, side * 0.07]} raycast={() => undefined}>
        <cylinderGeometry args={[0.16, 0.2, 0.05, 40]} />
        <meshStandardMaterial color="#23272e" metalness={0.7} roughness={0.4} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, side * 0.1]} raycast={() => undefined}>
        <cylinderGeometry args={[0.228, 0.228, 0.012, 64]} />
        <meshStandardMaterial color="#3a4048" metalness={0.78} roughness={0.32} />
      </mesh>
      <mesh position={[0, 0, side * 0.1]} raycast={() => undefined}>
        <torusGeometry args={[0.226, 0.007, 8, 48]} />
        <meshStandardMaterial color="#c5c9d0" metalness={0.8} roughness={0.22} />
      </mesh>
      {inserts.map((angle) => (
        <mesh
          key={angle}
          position={[Math.cos(angle) * 0.12, Math.sin(angle) * 0.12, side * 0.108]}
          rotation={[0, 0, angle + 0.4]}
          raycast={() => undefined}
        >
          <boxGeometry args={[0.07, 0.016, 0.004]} />
          <meshStandardMaterial color="#121418" metalness={0.3} roughness={0.55} />
        </mesh>
      ))}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, side * 0.112]} raycast={() => undefined}>
        <cylinderGeometry args={[0.04, 0.04, 0.008, 28]} />
        <meshStandardMaterial color="#b7bcc4" metalness={0.75} roughness={0.25} />
      </mesh>
    </group>
  );
}
