import { useMemo, useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import type { ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import type { Mode } from "../model";
import { isOpen } from "../model";
import { damp } from "./damp";
import { FRONT_X, REAR_X, WHEEL_R } from "./layout";

function silhouette(): THREE.Shape {
  const points: Array<[number, number]> = [
    [2.3, 0.28],
    [2.22, 0.5],
    [1.85, 0.66],
    [1.25, 0.76],
    [0.78, 0.9],
    [0.42, 1.18],
    [0.05, 1.36],
    [-0.45, 1.4],
    [-0.95, 1.28],
    [-1.35, 1.04],
    [-1.72, 0.84],
    [-2.12, 0.7],
    [-2.34, 0.48],
    [-2.38, 0.28],
    [-2.28, 0.18],
    [2.18, 0.18],
    [2.3, 0.28],
  ];
  const curve = new THREE.CatmullRomCurve3(
    points.map(([x, y]) => new THREE.Vector3(x, y, 0)),
    false,
    "catmullrom",
    0.45,
  );
  const sampled = curve.getPoints(90);
  const shape = new THREE.Shape();
  shape.moveTo(sampled[0].x, sampled[0].y);
  for (let i = 1; i < sampled.length; i += 1) {
    shape.lineTo(sampled[i].x, sampled[i].y);
  }
  return shape;
}

function pinch(geo: THREE.BufferGeometry) {
  const position = geo.attributes.position;
  const vertex = new THREE.Vector3();
  for (let i = 0; i < position.count; i += 1) {
    vertex.fromBufferAttribute(position, i);
    const height = THREE.MathUtils.smoothstep(vertex.y, 0.2, 1.22);
    const front = THREE.MathUtils.smoothstep(vertex.x, 1.1, 2.3);
    const rear = THREE.MathUtils.smoothstep(-vertex.x, 1.25, 2.38);
    const skirt = 1 - THREE.MathUtils.smoothstep(vertex.y, 0.18, 0.46);
    const width = 1 - height * 0.2 - Math.max(front, rear) * 0.4 - skirt * 0.1;
    position.setZ(i, vertex.z * Math.max(0.34, width));
  }
  position.needsUpdate = true;
}

function bodyGeometry(): THREE.BufferGeometry {
  const depth = 1.7;
  const geo = new THREE.ExtrudeGeometry(silhouette(), {
    depth,
    bevelEnabled: true,
    bevelThickness: 0.04,
    bevelSize: 0.045,
    bevelSegments: 5,
    curveSegments: 8,
  });
  geo.translate(0, 0, -depth / 2);
  pinch(geo);
  geo.computeVertexNormals();
  return geo;
}

const GLASS_PANELS: Array<{
  position: [number, number, number];
  rotation: [number, number, number];
  size: [number, number, number];
}> = [
  { position: [0.62, 1.12, 0], rotation: [0, 0, -0.55], size: [0.025, 0.62, 1.22] },
  { position: [-0.28, 1.385, 0], rotation: [0, 0, -0.04], size: [1.15, 0.02, 1.12] },
  { position: [-1.22, 1.12, 0], rotation: [0, 0, 0.58], size: [0.025, 0.5, 1.12] },
  { position: [-0.15, 1.08, 0.7], rotation: [0, 0, -0.04], size: [1.15, 0.28, 0.02] },
  { position: [-0.15, 1.08, -0.7], rotation: [0, 0, -0.04], size: [1.15, 0.28, 0.02] },
];

function Glass({ material }: { material: THREE.MeshPhysicalMaterial }) {
  return (
    <group>
      {GLASS_PANELS.map((panel) => (
        <mesh
          key={panel.position.join(",")}
          position={panel.position}
          rotation={panel.rotation}
          raycast={() => undefined}
          material={material}
        >
          <boxGeometry args={panel.size} />
        </mesh>
      ))}
    </group>
  );
}

function Lamps() {
  return (
    <group>
      {[0.52, -0.52].map((z) => (
        <mesh key={z} position={[2.2, 0.58, z]} raycast={() => undefined}>
          <boxGeometry args={[0.045, 0.07, 0.32]} />
          <meshStandardMaterial color="#f4f7fb" emissive="#e7f1ff" emissiveIntensity={1.6} toneMapped={false} />
        </mesh>
      ))}
      {[0.58, -0.58].map((z) => (
        <mesh key={`tail-${z}`} position={[-2.28, 0.62, z]} raycast={() => undefined}>
          <boxGeometry args={[0.04, 0.08, 0.34]} />
          <meshStandardMaterial color="#3a1014" emissive="#ff4d55" emissiveIntensity={0.7} toneMapped={false} />
        </mesh>
      ))}
      <mesh position={[-2.22, 0.7, 0.78]} rotation={[0, 0, Math.PI / 2]} raycast={() => undefined}>
        <cylinderGeometry args={[0.055, 0.055, 0.03, 20]} />
        <meshStandardMaterial color="#1b1e24" metalness={0.6} roughness={0.35} />
      </mesh>
    </group>
  );
}

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
      <mesh position={[0.15, 0.48, 0.38]} material={cloth} raycast={() => undefined}>
        <boxGeometry args={[0.48, 0.4, 0.46]} />
      </mesh>
      <mesh position={[0.15, 0.48, -0.38]} material={cloth} raycast={() => undefined}>
        <boxGeometry args={[0.48, 0.4, 0.46]} />
      </mesh>
      <mesh position={[-0.85, 0.5, 0]} material={cloth} raycast={() => undefined}>
        <boxGeometry args={[0.55, 0.42, 1.15]} />
      </mesh>
      <mesh
        position={[0.48, 0.78, 0.38]}
        rotation={[Math.PI / 2.4, 0, 0]}
        material={wheel}
        onClick={(event: ThreeEvent<MouseEvent>) => {
          event.stopPropagation();
          onComputer();
        }}
      >
        <torusGeometry args={[0.16, 0.018, 8, 20]} />
      </mesh>
      <mesh
        position={[0.55, 0.92, -0.28]}
        rotation={[0, 0.4, -0.15]}
        material={screen}
        onClick={(event: ThreeEvent<MouseEvent>) => {
          event.stopPropagation();
          onComputer();
        }}
      >
        <boxGeometry args={[0.04, 0.18, 0.36]} />
      </mesh>
    </group>
  );
}

export function Body({ mode, onOpen, onComputer }: { mode: Mode; onOpen: () => void; onComputer: () => void }) {
  const geo = useMemo(bodyGeometry, []);
  const paint = useRef<THREE.MeshPhysicalMaterial>(null);
  const ghost = useRef<THREE.MeshPhysicalMaterial>(null);
  const shell = useRef<THREE.Mesh>(null);
  const open = useRef(isOpen(mode) ? 1 : 0);
  const paintColor = useMemo(() => new THREE.Color("#f3f1eb"), []);
  const ghostColor = useMemo(() => new THREE.Color("#d5e2ef"), []);
  const interior = useRef<THREE.Group>(null);
  const glassMat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: "#10141a",
        roughness: 0.08,
        metalness: 0.15,
        transparent: true,
        opacity: 0.78,
        transmission: 0.4,
        thickness: 0.2,
      }),
    [],
  );
  const clothMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#2a2d33", roughness: 0.85, transparent: true, opacity: 0 }),
    [],
  );
  const wheelMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#c8c4bc", metalness: 0.8, roughness: 0.3, transparent: true, opacity: 0 }),
    [],
  );
  const screenMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#07080c",
        emissive: "#9fb4ff",
        emissiveIntensity: 0.35,
        transparent: true,
        opacity: 0,
      }),
    [],
  );

  useFrame((_, dt) => {
    open.current = damp(open.current, isOpen(mode) ? 1 : 0, dt, 4.5);
    const amount = open.current;
    if (paint.current) {
      paint.current.opacity = 1 - amount;
      paint.current.transparent = amount > 0.02;
      paint.current.depthWrite = amount < 0.85;
    }
    if (ghost.current) {
      ghost.current.opacity = amount * 0.22;
      ghost.current.color.copy(paintColor).lerp(ghostColor, amount);
    }
    glassMat.opacity = 0.78 * (1 - amount);
    const cabin = Math.max(0, Math.min(1, (amount - 0.25) / 0.75));
    clothMat.opacity = cabin;
    wheelMat.opacity = cabin;
    screenMat.opacity = cabin;
    if (interior.current) interior.current.visible = cabin > 0.04;
    if (shell.current) {
      shell.current.raycast = amount > 0.55 ? () => undefined : THREE.Mesh.prototype.raycast;
    }
  });

  return (
    <group>
      <mesh
        ref={shell}
        geometry={geo}
        castShadow
        onClick={(event: ThreeEvent<MouseEvent>) => {
          event.stopPropagation();
          if (open.current < 0.55) onOpen();
        }}
        onPointerOver={() => {
          if (open.current < 0.55) document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          document.body.style.cursor = "";
        }}
      >
        <meshPhysicalMaterial
          ref={paint}
          color="#f3f1eb"
          metalness={0.62}
          roughness={0.28}
          clearcoat={1}
          clearcoatRoughness={0.08}
          reflectivity={0.5}
        />
      </mesh>
      <mesh geometry={geo} scale={[1.008, 1.008, 1.012]} raycast={() => undefined}>
        <meshPhysicalMaterial
          ref={ghost}
          color="#d5e2ef"
          metalness={0.04}
          roughness={0.06}
          transmission={0.94}
          thickness={0.55}
          transparent
          opacity={0}
          depthWrite={false}
          ior={1.4}
        />
      </mesh>
      <Glass material={glassMat} />
      <Lamps />
      <Interior cloth={clothMat} wheel={wheelMat} screen={screenMat} onComputer={onComputer} group={interior} />
      <Arch x={FRONT_X} />
      <Arch x={REAR_X} />
      <mesh position={[0.35, 0.86, 0.92]} rotation={[0.1, 0, -0.4]} raycast={() => undefined}>
        <boxGeometry args={[0.18, 0.1, 0.08]} />
        <meshStandardMaterial color="#f3f1eb" metalness={0.5} roughness={0.3} />
      </mesh>
      <mesh position={[0.35, 0.86, -0.92]} rotation={[0.1, 0, 0.4]} raycast={() => undefined}>
        <boxGeometry args={[0.18, 0.1, 0.08]} />
        <meshStandardMaterial color="#f3f1eb" metalness={0.5} roughness={0.3} />
      </mesh>
    </group>
  );
}

function Arch({ x }: { x: number }) {
  return (
    <group>
      {[1, -1].map((side) => (
        <group key={side} position={[x, WHEEL_R, side * 0.78]}>
          <mesh rotation={[Math.PI / 2, 0, 0]} raycast={() => undefined}>
            <circleGeometry args={[0.4, 28]} />
            <meshBasicMaterial color="#05060a" />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, side * 0.06, 0]}>
            <torusGeometry args={[0.4, 0.028, 8, 24, Math.PI]} />
            <meshStandardMaterial color="#f7f5ef" metalness={0.45} roughness={0.32} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
