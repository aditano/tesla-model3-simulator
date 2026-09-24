import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import type { Mode } from "../model";
import { emphasis } from "../model";
import { damp } from "./damp";
import { FlowTube } from "./flow";
import { COMPUTER, FRONT_X, PENTHOUSE, REAR_X } from "./layout";
import { Tag } from "./tags";

const CAMERAS: { name: string; at: [number, number, number] }[] = [
  { name: "Windshield cameras", at: [0.95, 1.18, 0] },
  { name: "Repeater", at: [0.35, 0.82, 0.9] },
  { name: "Repeater", at: [0.35, 0.82, -0.9] },
  { name: "Rear camera", at: [-2.22, 0.85, 0] },
];

const CAMERA_LINKS = CAMERAS.map((camera) => ({
  key: camera.at.join(","),
  points: [camera.at, [COMPUTER[0], COMPUTER[1], COMPUTER[2]]] as [number, number, number][],
}));

const REAR_DC: [number, number, number][] = [
  [PENTHOUSE[0], 0.36, 0.1],
  [-0.4, 0.28, 0.15],
  [REAR_X + 0.28, 0.42, 0],
];

const FRONT_DC: [number, number, number][] = [
  [PENTHOUSE[0], 0.36, -0.1],
  [0.2, 0.32, -0.15],
  [FRONT_X + 0.15, 0.42, 0],
];

export function Computers({ mode, assist, onSelect }: { mode: Mode; assist: number; onSelect: () => void }) {
  const core = useRef<THREE.MeshStandardMaterial>(null);
  const glow = useRef(0);
  const target = emphasis(mode, "computers");

  useFrame((_, dt) => {
    glow.current = damp(glow.current, target, dt, 5);
    if (core.current) {
      const load = mode === "computers" ? assist : 0.25;
      core.current.emissiveIntensity = glow.current * (0.2 + load * 2.4);
    }
  });

  if (mode !== "computers" && mode !== "inside" && mode !== "cooling") return null;

  const pick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    onSelect();
  };

  const focused = mode === "computers";
  const cameraGain = focused ? 0.12 + assist * 0.9 : 0.28;

  return (
    <group>
      <group position={COMPUTER} onClick={pick}>
        <mesh>
          <boxGeometry args={[0.26, 0.12, 0.32]} />
          <meshStandardMaterial color="#8b93a0" metalness={0.65} roughness={0.32} transparent opacity={focused ? 0.35 : 0.75} />
        </mesh>
        <mesh>
          <boxGeometry args={[0.16, 0.06, 0.2]} />
          <meshStandardMaterial ref={core} color="#6d5cff" emissive="#b7a6ff" emissiveIntensity={0.4} toneMapped={false} />
        </mesh>
        {(focused || mode === "inside") && (
          <Tag position={[0, 0.22, 0]} active={focused} onClick={onSelect}>
            Car computer
          </Tag>
        )}
        {focused ? <Tag position={[0.18, 0.08, -0.2]}>Liquid cooled</Tag> : null}
      </group>

      {focused || mode === "inside"
        ? CAMERAS.map((camera) => (
            <mesh key={camera.at.join(",")} position={camera.at}>
              <boxGeometry args={[0.06, 0.04, 0.08]} />
              <meshStandardMaterial color="#1b1e26" emissive="#c7b6ff" emissiveIntensity={focused ? 0.2 + assist * 2 : 0.3} toneMapped={false} />
            </mesh>
          ))
        : null}
      {focused
        ? CAMERAS.filter((camera) => camera.name !== "Repeater" || camera.at[2] > 0).map((camera) => (
            <Tag key={camera.name + camera.at[2]} position={[camera.at[0], camera.at[1] + 0.12, camera.at[2]]}>
              {camera.name}
            </Tag>
          ))
        : null}

      {focused || mode === "inside"
        ? CAMERA_LINKS.map((link) => (
            <FlowTube
              key={`link-${link.key}`}
              points={link.points}
              color="#c7b6ff"
              radius={0.004}
              speed={0.25 + assist * 0.4}
              gain={cameraGain}
            />
          ))
        : null}

      {focused || mode === "inside" ? (
        <>
          <FlowTube points={REAR_DC} color="#f3f6ff" radius={0.007} speed={0.2} gain={focused ? 0.75 : 0.3} />
          <FlowTube points={FRONT_DC} color="#f3f6ff" radius={0.006} speed={0.18} gain={focused ? 0.6 : 0.22} />
        </>
      ) : null}
      {focused ? (
        <>
          <Tag position={[REAR_X + 0.28, 0.62, 0]}>Rear inverter</Tag>
          <Tag position={[FRONT_X + 0.1, 0.62, 0]}>Front inverter</Tag>
        </>
      ) : null}
    </group>
  );
}
