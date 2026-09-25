import { useMemo, useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import type { ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import type { Mode } from "../model";
import { isOpen } from "../model";
import { createBodyGeometry, createGlassGeometry } from "./carMesh";
import { damp } from "./damp";

function Interior({
  cloth,
  wheel,
  screen,
  onComputer,
  group,
}: {
  cloth: THREE.MeshStandardMaterial;
  wheel: THREE.MeshStandardMaterial;
  screen: THREE.MeshStandardMaterial;
  onComputer: () => void;
  group: RefObject<THREE.Group>;
}) {
  return (
    <group ref={group} visible={false}>
      <mesh position={[0.12, 0.55, 0.34]} material={cloth} raycast={() => undefined}>
        <boxGeometry args={[0.46, 0.42, 0.42]} />
      </mesh>
      <mesh position={[0.12, 0.55, -0.34]} material={cloth} raycast={() => undefined}>
        <boxGeometry args={[0.46, 0.42, 0.42]} />
      </mesh>
      <mesh position={[-0.72, 0.58, 0]} material={cloth} raycast={() => undefined}>
        <boxGeometry args={[0.5, 0.4, 1.05]} />
      </mesh>
      <mesh
        position={[0.42, 0.78, 0.32]}
        rotation={[Math.PI / 2.15, 0.15, 0]}
        material={wheel}
        onClick={(event: ThreeEvent<MouseEvent>) => {
          event.stopPropagation();
          onComputer();
        }}
      >
        <torusGeometry args={[0.15, 0.016, 10, 24]} />
      </mesh>
      <mesh
        position={[0.48, 0.92, -0.22]}
        rotation={[0.1, 0.35, -0.08]}
        material={screen}
        onClick={(event: ThreeEvent<MouseEvent>) => {
          event.stopPropagation();
          onComputer();
        }}
      >
        <boxGeometry args={[0.02, 0.16, 0.28]} />
      </mesh>
    </group>
  );
}

export function Body({ mode, onOpen, onComputer }: { mode: Mode; onOpen: () => void; onComputer: () => void }) {
  const body = useMemo(createBodyGeometry, []);
  const glassGeo = useMemo(createGlassGeometry, []);
  const shell = useRef<THREE.Mesh>(null);
  const clearShell = useRef<THREE.Mesh>(null);
  const open = useRef(isOpen(mode) ? 1 : 0);
  const interior = useRef<THREE.Group>(null);
  const paint = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: "#f3f0ea",
        metalness: 0.06,
        roughness: 0.2,
        clearcoat: 1,
        clearcoatRoughness: 0.045,
        envMapIntensity: 1.05,
        sheen: 0.06,
        sheenColor: new THREE.Color("#fff6ee"),
        sheenRoughness: 0.35,
      }),
    [],
  );
  const clear = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: "#e8eef6",
        metalness: 0,
        roughness: 0.015,
        transmission: 1,
        thickness: 0.16,
        ior: 1.45,
        transparent: true,
        opacity: 0,
        envMapIntensity: 1.8,
        attenuationColor: new THREE.Color("#d5e4f2"),
        attenuationDistance: 1.8,
        side: THREE.FrontSide,
        depthWrite: false,
      }),
    [],
  );
  const glassMat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: "#101820",
        roughness: 0.02,
        metalness: 0,
        transmission: 1,
        thickness: 0.22,
        ior: 1.5,
        transparent: true,
        opacity: 1,
        envMapIntensity: 1.7,
        attenuationColor: new THREE.Color("#0c141c"),
        attenuationDistance: 0.9,
      }),
    [],
  );
  const clothMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#3a4048", roughness: 0.86, transparent: true, opacity: 0 }),
    [],
  );
  const wheelMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#c8c4bc", metalness: 0.85, roughness: 0.25, transparent: true, opacity: 0 }),
    [],
  );
  const screenMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#07080c",
        emissive: "#9fb4ff",
        emissiveIntensity: 0.45,
        transparent: true,
        opacity: 0,
      }),
    [],
  );

  useFrame((_, dt) => {
    open.current = damp(open.current, isOpen(mode) ? 1 : 0, dt, 3.2);
    const amount = open.current;
    paint.opacity = 1 - amount;
    paint.transparent = amount > 0.02;
    paint.depthWrite = amount < 0.35;
    clear.opacity = Math.min(0.62, amount * 0.68);
    clear.depthWrite = false;
    clear.thickness = 0.16;
    clear.roughness = 0.015;
    glassMat.roughness = THREE.MathUtils.lerp(0.02, 0.04, amount);
    glassMat.thickness = THREE.MathUtils.lerp(0.22, 0.05, amount);
    glassMat.color.set(amount > 0.55 ? "#d5e3ef" : "#101820");
    glassMat.attenuationColor.set(amount > 0.55 ? "#eef4f8" : "#0c141c");
    glassMat.attenuationDistance = THREE.MathUtils.lerp(0.9, 6, amount);
    glassMat.envMapIntensity = THREE.MathUtils.lerp(1.7, 1.35, amount);
    glassMat.depthWrite = amount < 0.5;
    glassMat.opacity = 1;
    const cabin = Math.max(0, Math.min(1, (amount - 0.2) / 0.8));
    clothMat.opacity = cabin;
    wheelMat.opacity = cabin;
    screenMat.opacity = cabin;
    if (interior.current) interior.current.visible = cabin > 0.04;
    if (shell.current) {
      shell.current.visible = amount < 0.97;
      shell.current.raycast = amount > 0.45 ? () => undefined : THREE.Mesh.prototype.raycast;
    }
    if (clearShell.current) clearShell.current.visible = amount > 0.02;
  });

  return (
    <group>
      <mesh
        ref={shell}
        geometry={body}
        material={paint}
        onClick={(event: ThreeEvent<MouseEvent>) => {
          event.stopPropagation();
          if (open.current < 0.45) onOpen();
        }}
        onPointerOver={() => {
          if (open.current < 0.45) document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          document.body.style.cursor = "";
        }}
      />
      <mesh ref={clearShell} geometry={body} material={clear} scale={1.004} visible={false} raycast={() => undefined} />
      <mesh geometry={glassGeo} material={glassMat} raycast={() => undefined} />
      <pointLight position={[0.15, 0.95, 0]} intensity={1.8} distance={3.4} color="#f4f7ff" />
      <Lamps />
      <Mirrors />
      <Interior cloth={clothMat} wheel={wheelMat} screen={screenMat} onComputer={onComputer} group={interior} />
    </group>
  );
}

function Lamps() {
  return (
    <group>
      {[0.62, -0.62].map((z) => (
        <group key={z} position={[2.08, 0.62, z]} rotation={[0, z > 0 ? -0.4 : 0.4, 0]}>
          <mesh position={[-0.02, 0, 0]} raycast={() => undefined}>
            <boxGeometry args={[0.12, 0.055, 0.42]} />
            <meshStandardMaterial color="#14171c" metalness={0.45} roughness={0.32} />
          </mesh>
          <mesh position={[0.03, 0, 0]} raycast={() => undefined}>
            <boxGeometry args={[0.04, 0.028, 0.32]} />
            <meshStandardMaterial color="#dfe7f2" emissive="#f4f8ff" emissiveIntensity={0.7} />
          </mesh>
        </group>
      ))}
      <mesh position={[-2.28, 0.78, 0]} raycast={() => undefined}>
        <boxGeometry args={[0.035, 0.028, 1.05]} />
        <meshStandardMaterial color="#3a1418" emissive="#ff3340" emissiveIntensity={0.45} />
      </mesh>
      <mesh position={[2.12, 0.28, 0]} raycast={() => undefined}>
        <boxGeometry args={[0.08, 0.08, 1.2]} />
        <meshStandardMaterial color="#101216" roughness={0.55} metalness={0.25} />
      </mesh>
      <mesh position={[-2.22, 0.82, 0.62]} rotation={[0, 0.4, Math.PI / 2]} raycast={() => undefined}>
        <cylinderGeometry args={[0.045, 0.045, 0.02, 20]} />
        <meshStandardMaterial color="#1a1d22" metalness={0.7} roughness={0.28} />
      </mesh>
    </group>
  );
}

function Mirrors() {
  return (
    <group>
      {[1, -1].map((side) => (
        <group key={side} position={[0.62, 1.02, side * 1.0]}>
          <mesh rotation={[0, 0, Math.PI / 2]} raycast={() => undefined}>
            <capsuleGeometry args={[0.035, 0.12, 4, 8]} />
            <meshPhysicalMaterial color="#f6f3ec" metalness={0.04} roughness={0.2} clearcoat={1} clearcoatRoughness={0.05} />
          </mesh>
          <mesh position={[0.02, 0, side * 0.08]} raycast={() => undefined}>
            <boxGeometry args={[0.08, 0.06, 0.1]} />
            <meshStandardMaterial color="#0e1218" roughness={0.15} metalness={0.4} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
