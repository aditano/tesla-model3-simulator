import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import type { Mode } from "../model";
import { emphasis } from "../model";
import { damp } from "./damp";
import { PENTHOUSE } from "./layout";
import { Tag } from "./tags";

function Beads({
  points,
  color,
  speed,
  gain,
}: {
  points: readonly [number, number, number][];
  color: string;
  speed: number;
  gain: number;
}) {
  const count = 7;
  const mesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const curve = useMemo(() => new THREE.CatmullRomCurve3(points.map((point) => new THREE.Vector3(...point))), [points]);

  useFrame((state) => {
    const inst = mesh.current;
    if (!inst) return;
    const time = state.clock.elapsedTime * speed;
    for (let index = 0; index < count; index += 1) {
      const u = (((index / count + time) % 1) + 1) % 1;
      dummy.position.copy(curve.getPoint(u));
      const scale = gain * (0.55 + 0.45 * (index / count));
      dummy.scale.setScalar(Math.max(0.001, scale));
      dummy.updateMatrix();
      inst.setMatrixAt(index, dummy.matrix);
    }
    inst.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
      <sphereGeometry args={[0.02, 10, 10]} />
      <meshBasicMaterial color={color} transparent opacity={0.95} toneMapped={false} depthWrite={false} />
    </instancedMesh>
  );
}

const AC: readonly [number, number, number][] = [
  [-2.22, 0.7, 0.78],
  [-2.05, 0.62, 0.55],
  [-1.95, 0.5, 0.28],
  [-1.72, 0.46, 0.22],
];

const DC: readonly [number, number, number][] = [
  [-1.72, 0.44, 0.22],
  [-1.55, 0.32, 0.05],
  [-1.1, 0.3, 0],
  [0.2, 0.3, 0],
  [0.72, 0.32, 0],
];

export function Penthouse({ mode, soc, onSelect }: { mode: Mode; soc: number; onSelect: () => void }) {
  const cover = useRef<THREE.MeshPhysicalMaterial>(null);
  const glow = useRef(0);
  const target = emphasis(mode, "penthouse");
  const incoming = soc > 0.97 ? 0 : (1 - soc) * 0.85 + 0.08;

  useFrame((_, dt) => {
    glow.current = damp(glow.current, target, dt, 5);
    if (cover.current) {
      cover.current.opacity = THREE.MathUtils.lerp(0.9, 0.12, glow.current);
      cover.current.transmission = THREE.MathUtils.lerp(0, 0.75, glow.current);
    }
  });

  const pick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    onSelect();
  };

  const show = mode === "penthouse" || mode === "inside";

  return (
    <group>
      <group position={PENTHOUSE} onClick={pick}>
        <mesh>
          <boxGeometry args={[0.62, 0.22, 1.2]} />
          <meshPhysicalMaterial
            ref={cover}
            color="#b7c0ca"
            metalness={0.72}
            roughness={0.3}
            transparent
            opacity={0.9}
            transmission={0}
            thickness={0.3}
          />
        </mesh>
        <Part position={[0.02, 0, 0.32]} size={[0.28, 0.12, 0.32]} color="#d7a56a" />
        <Part position={[0.02, 0, -0.05]} size={[0.16, 0.1, 0.18]} color="#cfd6de" />
        <Part position={[0.02, 0, -0.28]} size={[0.1, 0.08, 0.1]} color="#e07a4c" />
        <Part position={[-0.02, 0, -0.48]} size={[0.22, 0.08, 0.16]} color="#9eb0c4" />
        {show ? (
          <Tag position={[0, 0.28, 0]} active={mode === "penthouse"} onClick={onSelect}>
            Penthouse
          </Tag>
        ) : null}
        {mode === "penthouse" ? (
          <>
            <Tag position={[0.02, 0.2, 0.32]}>Onboard charger</Tag>
            <Tag position={[0.02, 0.18, -0.05]}>Contactors</Tag>
            <Tag position={[0.02, 0.16, -0.28]}>Pyro disconnect</Tag>
            <Tag position={[-0.02, 0.16, -0.48]}>HV controller</Tag>
          </>
        ) : null}
      </group>
      {mode === "penthouse" ? <Tag position={[-2.22, 0.88, 0.78]}>Charge port · AC</Tag> : null}
      {(mode === "penthouse" || mode === "inside") && (
        <>
          <Beads points={AC} color="#ffbf7a" speed={0.22 * incoming} gain={mode === "penthouse" ? incoming : 0.25} />
          <Beads points={DC} color="#f4f7ff" speed={0.22 * incoming} gain={mode === "penthouse" ? incoming : 0.2} />
        </>
      )}
    </group>
  );
}

function Part({
  position,
  size,
  color,
}: {
  position: [number, number, number];
  size: [number, number, number];
  color: string;
}) {
  return (
    <mesh position={position}>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.25} metalness={0.35} roughness={0.4} />
    </mesh>
  );
}
