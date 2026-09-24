import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import type { MutableRefObject } from "react";
import type { Mode } from "../model";
import { emphasis } from "../model";
import { damp } from "./damp";
import { FRONT_X, REAR_X } from "./layout";
import { Tag } from "./tags";

type Spin = MutableRefObject<{ rotor: number }>;

const RIBBONS = 8;

function ribbon(index: number): THREE.CatmullRomCurve3 {
  const angle = (index / RIBBONS) * Math.PI * 2;
  const points: THREE.Vector3[] = [];
  for (let step = 0; step <= 18; step += 1) {
    const t = step / 18;
    const a = angle + (t - 0.5) * 1.05;
    const radius = 0.105 + Math.sin(t * Math.PI) * 0.07;
    points.push(new THREE.Vector3(Math.cos(a) * radius, Math.sin(a) * radius, (t - 0.5) * 0.16));
  }
  return new THREE.CatmullRomCurve3(points);
}

export function Motor({
  mode,
  motor,
  spin,
  onSelect,
}: {
  mode: Mode;
  motor: number;
  spin: Spin;
  onSelect: () => void;
}) {
  const housing = useRef<THREE.MeshPhysicalMaterial>(null);
  const oil = useRef<THREE.MeshStandardMaterial>(null);
  const rotor = useRef<THREE.Group>(null);
  const glow = useRef(0);
  const curves = useMemo(() => Array.from({ length: RIBBONS }, (_, index) => ribbon(index)), []);
  const copperMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#b87348",
        emissive: new THREE.Color("#e39a55"),
        emissiveIntensity: 0.2,
        metalness: 0.65,
        roughness: 0.28,
        toneMapped: false,
      }),
    [],
  );
  const fieldMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: "#c9b6ff",
        transparent: true,
        opacity: 0.2,
        toneMapped: false,
        depthWrite: false,
      }),
    [],
  );
  const target = emphasis(mode, "motor");

  useFrame((_, dt) => {
    glow.current = damp(glow.current, target, dt, 5);
    const heat = mode === "motor" ? motor : 0.2;
    if (rotor.current) rotor.current.rotation.z = spin.current.rotor;
    if (housing.current) {
      housing.current.opacity = THREE.MathUtils.lerp(0.92, 0.14, glow.current);
      housing.current.transmission = THREE.MathUtils.lerp(0.001, 0.85, glow.current);
      housing.current.transparent = true;
    }
    copperMat.emissiveIntensity = 0.15 + heat * glow.current * 2.4;
    if (oil.current) oil.current.emissiveIntensity = 0.05 + heat * glow.current * 2.2;
    fieldMat.opacity = glow.current * (0.18 + heat * 0.82);
  });

  const pick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    onSelect();
  };

  return (
    <group>
      <group position={[REAR_X, 0.4, 0]} onClick={pick}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.25, 0.25, 0.62, 36]} />
          <meshPhysicalMaterial
            ref={housing}
            color="#9aa3ad"
            metalness={0.75}
            roughness={0.28}
            transparent
            opacity={0.92}
            transmission={0.001}
            thickness={0.4}
          />
        </mesh>
        <mesh position={[0.28, 0.02, 0]}>
          <boxGeometry args={[0.16, 0.22, 0.3]} />
          <meshStandardMaterial color="#8e98a3" metalness={0.7} roughness={0.32} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.19, 0.19, 0.34, 28, 1, true]} />
          <meshStandardMaterial color="#3a4048" metalness={0.55} roughness={0.45} side={THREE.DoubleSide} />
        </mesh>
        {[-0.16, 0.16].map((z) => (
          <mesh key={z} position={[0, 0, z]} rotation={[Math.PI / 2, 0, 0]} material={copperMat}>
            <torusGeometry args={[0.155, 0.02, 10, 28]} />
          </mesh>
        ))}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.132, 0.008, 8, 28]} />
          <meshStandardMaterial
            ref={oil}
            color="#e7b15a"
            emissive="#ffbf70"
            emissiveIntensity={0.2}
            toneMapped={false}
            transparent
            opacity={0.9}
          />
        </mesh>
        <mesh position={[0.3, -0.08, 0.12]}>
          <boxGeometry args={[0.1, 0.08, 0.14]} />
          <meshStandardMaterial color="#7f93a8" emissive="#8fd4ff" emissiveIntensity={0.35} metalness={0.5} roughness={0.35} />
        </mesh>
        <group ref={rotor}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.09, 0.09, 0.3, 24]} />
            <meshStandardMaterial color="#2c3138" metalness={0.7} roughness={0.35} />
          </mesh>
          {Array.from({ length: 6 }, (_, index) => {
            const angle = (index / 6) * Math.PI * 2;
            return (
              <mesh key={index} position={[Math.cos(angle) * 0.062, Math.sin(angle) * 0.062, 0]} rotation={[0, 0, angle]}>
                <boxGeometry args={[0.02, 0.045, 0.18]} />
                <meshStandardMaterial color="#d9d3c7" metalness={0.45} roughness={0.4} />
              </mesh>
            );
          })}
          {curves.map((curve, index) => (
            <mesh key={index} material={fieldMat}>
              <tubeGeometry args={[curve, 18, 0.005, 6, false]} />
            </mesh>
          ))}
        </group>
        {mode === "motor" || mode === "inside" ? (
          <Tag position={[0, 0.42, 0]} active={mode === "motor"} onClick={onSelect}>
            Rear motor
          </Tag>
        ) : null}
        {mode === "motor" ? (
          <>
            <Tag position={[0.34, 0.22, 0]}>Inverter</Tag>
            <Tag position={[0.36, -0.16, 0.2]}>Oil ↔ glycol</Tag>
          </>
        ) : null}
      </group>

      {(mode === "motor" || mode === "inside" || mode === "computers") && (
        <group position={[FRONT_X, 0.4, 0]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.2, 0.2, 0.48, 28]} />
            <meshStandardMaterial color="#8b949e" metalness={0.7} roughness={0.34} transparent opacity={mode === "motor" ? 0.85 : 0.35} />
          </mesh>
          {mode === "motor" ? <Tag position={[0, 0.36, 0]}>Front · induction</Tag> : null}
        </group>
      )}
    </group>
  );
}
