import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { RoundedBox } from "@react-three/drei";
import type { Mode } from "../model";
import { emphasis } from "../model";
import { damp } from "./damp";
import { Tag } from "./tags";

const COLS = 16;
const ROWS = 8;
const COUNT = COLS * ROWS;
const PITCH_X = 0.024;
const PITCH_Z = 0.03;

const MODULES = [
  { x: 0.72, length: 0.58, series: "23 series", cutaway: true },
  { x: 0.05, length: 0.68, series: "25 series", cutaway: false },
  { x: -0.68, length: 0.68, series: "25 series", cutaway: false },
  { x: -1.38, length: 0.58, series: "23 series", cutaway: false },
] as const;

export function Battery({
  mode,
  flow,
  soc,
  onSelect,
}: {
  mode: Mode;
  flow: number;
  soc: number;
  onSelect: () => void;
}) {
  const glow = useRef(0);
  const shell = useRef<THREE.MeshStandardMaterial>(null);
  const sill = useRef<THREE.MeshStandardMaterial>(null);
  const cells = useRef<THREE.InstancedMesh>(null);
  const columns = useMemo(() => new Int16Array(COUNT), []);
  const color = useMemo(() => new THREE.Color(), []);
  const target = emphasis(mode, "battery");

  useLayoutEffect(() => {
    const mesh = cells.current;
    if (!mesh) return;
    const dummy = new THREE.Object3D();
    let index = 0;
    for (let row = 0; row < ROWS; row += 1) {
      for (let col = 0; col < COLS; col += 1) {
        dummy.position.set((col - (COLS - 1) / 2) * PITCH_X, 0, (row - (ROWS - 1) / 2) * PITCH_Z);
        dummy.rotation.set(0, 0, 0);
        dummy.updateMatrix();
        mesh.setMatrixAt(index, dummy.matrix);
        columns[index] = col;
        index += 1;
      }
    }
    mesh.instanceMatrix.needsUpdate = true;
  }, [columns]);

  useFrame((state, dt) => {
    glow.current = damp(glow.current, target, dt, 5);
    if (shell.current) {
      shell.current.opacity = mode === "battery" ? 0.08 : mode === "inside" ? 0.28 : 0.55;
      shell.current.transparent = true;
    }
    if (sill.current) {
      sill.current.emissiveIntensity = glow.current * 0.6;
    }
    const mesh = cells.current;
    if (!mesh) return;
    const time = state.clock.elapsedTime;
    for (let index = 0; index < COUNT; index += 1) {
      const col = columns[index];
      let lit = 0.15;
      if (mode === "penthouse") {
        const filled = (col + 0.5) / COLS <= soc;
        lit = filled ? 0.55 + (1 - soc) * 0.35 : 0.08;
      } else {
        const wave = 0.5 + 0.5 * Math.sin(time * (0.6 + flow * 7) - col * 0.45);
        lit = 0.12 + flow * wave * 0.9;
      }
      const show = mode === "overview" ? 0 : 0.35 + glow.current * 0.65;
      color.setRGB(0.25 + lit * 0.35, 0.32 + lit * 0.55, 0.28 + lit * 0.25);
      color.multiplyScalar(show);
      mesh.setColorAt(index, color);
    }
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  });

  const pick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    onSelect();
  };

  return (
    <group onClick={pick}>
      <RoundedBox args={[3.05, 0.12, 1.42]} radius={0.03} smoothness={4} position={[-0.28, 0.2, 0]}>
        <meshStandardMaterial ref={shell} color="#c5cbd3" metalness={0.82} roughness={0.28} transparent opacity={0.9} />
      </RoundedBox>
      {[-0.66, 0.66].map((z) => (
        <mesh key={z} position={[-0.25, 0.2, z]}>
          <boxGeometry args={[3.15, 0.08, 0.08]} />
          <meshStandardMaterial ref={z > 0 ? sill : undefined} color="#8d949c" emissive="#d7dde6" emissiveIntensity={0} metalness={0.7} roughness={0.35} />
        </mesh>
      ))}
      {MODULES.map((module) =>
        module.cutaway ? null : (
          <RoundedBox key={module.x} args={[module.length, 0.1, 1.2]} radius={0.02} smoothness={3} position={[module.x, 0.28, 0]}>
            <meshStandardMaterial color="#b7bec6" metalness={0.78} roughness={0.3} />
          </RoundedBox>
        ),
      )}
      <group position={[0.72, 0.3, 0]}>
        <instancedMesh ref={cells} args={[undefined, undefined, COUNT]}>
          <cylinderGeometry args={[0.0095, 0.0095, 0.07, 10]} />
          <meshStandardMaterial color="#d7fff1" emissive="#7dffe4" emissiveIntensity={0.65} roughness={0.4} metalness={0.15} toneMapped={false} />
        </instancedMesh>
        {Array.from({ length: ROWS - 1 }, (_, row) => (
          <mesh key={row} position={[0, 0, (row - (ROWS - 2) / 2) * PITCH_Z]}>
            <boxGeometry args={[0.4, 0.012, 0.008]} />
            <meshStandardMaterial color="#7eb7d8" emissive="#9fd4ff" emissiveIntensity={0.8} transparent opacity={0.85} toneMapped={false} />
          </mesh>
        ))}
        <mesh position={[0, 0.042, 0]}>
          <boxGeometry args={[0.4, 0.006, 0.26]} />
          <meshStandardMaterial color="#c9845a" emissive="#e7a36a" emissiveIntensity={0.7 + flow} metalness={0.6} roughness={0.3} toneMapped={false} />
        </mesh>
      </group>
      {(mode === "battery" || mode === "inside") && (
        <Tag position={[-0.15, 0.55, 0]} active={mode === "battery"} onClick={onSelect}>
          2170 pack
        </Tag>
      )}
      {mode === "battery"
        ? MODULES.map((module) => (
            <Tag key={module.series + module.x} position={[module.x, 0.46, 0.78]}>
              {module.series}
            </Tag>
          ))
        : null}
      {mode === "battery" ? (
        <>
          <Tag position={[0.72, 0.52, 0]}>Parallel group — 46 in the real pack</Tag>
          <Tag position={[-0.2, 0.5, -0.85]}>Bolted floor rails</Tag>
        </>
      ) : null}
    </group>
  );
}
