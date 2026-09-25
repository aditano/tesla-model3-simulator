import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import type { Mode } from "../model";
import { isOpen } from "../model";
import { createBodyGeometry, createGlassGeometry } from "./carMesh";
import { damp } from "./damp";
import { readShot } from "./layout";
import { Cabin } from "./Cabin";
import { BODY_PAINT, CABIN_COLORS, isExteriorPaintTarget } from "./paint";
import { assignExteriorPaint, stripBodyPaintFromInterior } from "./paintAssign";

export function Body({ mode, onOpen, onComputer }: { mode: Mode; onOpen: () => void; onComputer: () => void }) {
  const body = useMemo(createBodyGeometry, []);
  const glassGeo = useMemo(createGlassGeometry, []);
  const group = useRef<THREE.Group>(null);
  const shell = useRef<THREE.Mesh>(null);
  const clearShell = useRef<THREE.Mesh>(null);
  const open = useRef(isOpen(mode) ? 1 : 0);
  const interior = useRef<THREE.Group>(null);
  const clip = useMemo(() => {
    if (readShot() !== "cabin") return [];
    return [new THREE.Plane(new THREE.Vector3(0, 0, 1), 0.02)];
  }, []);
  const paint = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: BODY_PAINT,
        metalness: 0.06,
        roughness: 0.2,
        clearcoat: 1,
        clearcoatRoughness: 0.045,
        envMapIntensity: 1.05,
        sheen: 0.06,
        sheenColor: new THREE.Color("#fff6ee"),
        sheenRoughness: 0.35,
        clippingPlanes: clip,
      }),
    [clip],
  );
  const mirrorPaint = useMemo(() => {
    const material = paint.clone();
    material.opacity = 1;
    material.transparent = false;
    material.depthWrite = true;
    material.clippingPlanes = clip;
    return material;
  }, [paint, clip]);
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
        clippingPlanes: clip,
      }),
    [clip],
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
        clippingPlanes: clip,
      }),
    [clip],
  );
  const plastic = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: CABIN_COLORS.dash,
        roughness: 0.72,
        metalness: 0.04,
        envMapIntensity: 0.35,
      }),
    [],
  );
  const carpet = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: CABIN_COLORS.carpet,
        roughness: 0.96,
        metalness: 0,
        envMapIntensity: 0.12,
      }),
    [],
  );
  const pad = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: CABIN_COLORS.pad,
        roughness: 0.58,
        metalness: 0.06,
        envMapIntensity: 0.2,
      }),
    [],
  );
  const padWell = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: CABIN_COLORS.padWell,
        roughness: 0.84,
        metalness: 0.02,
        envMapIntensity: 0.1,
      }),
    [],
  );
  const clothMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: CABIN_COLORS.upholstery,
        roughness: 0.9,
        metalness: 0,
        envMapIntensity: 0.15,
      }),
    [],
  );
  const wheelMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#c8c4bc", metalness: 0.85, roughness: 0.25 }),
    [],
  );
  const screenMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#07080c",
        emissive: "#9fb4ff",
        emissiveIntensity: 0.45,
      }),
    [],
  );

  useLayoutEffect(() => {
    const root = group.current;
    if (!root) return;
    const paints = new Set<THREE.Material>([paint, mirrorPaint]);
    stripBodyPaintFromInterior(root, paints, plastic);
    assignExteriorPaint(root, (name) => {
      if (!isExteriorPaintTarget(name)) return null;
      return name === "mirror-cap" ? mirrorPaint : paint;
    });
  }, [mirrorPaint, paint, plastic]);

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
    const trim = THREE.MathUtils.lerp(1, 0.18, amount);
    for (const material of [plastic, pad, padWell]) {
      material.opacity = trim;
      material.transparent = trim < 0.98;
      material.depthWrite = trim > 0.45;
    }
    carpet.opacity = THREE.MathUtils.lerp(1, 0.08, amount);
    carpet.transparent = carpet.opacity < 0.98;
    carpet.depthWrite = carpet.opacity > 0.45;
    mirrorPaint.opacity = 1;
    mirrorPaint.transparent = false;
    if (shell.current) {
      shell.current.visible = amount < 0.97;
      shell.current.raycast = amount > 0.45 ? () => undefined : THREE.Mesh.prototype.raycast;
    }
    if (clearShell.current) clearShell.current.visible = amount > 0.02;
  });

  return (
    <group ref={group}>
      <mesh
        name="body-shell"
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
      <mesh
        name="body-xray"
        ref={clearShell}
        geometry={body}
        material={clear}
        scale={1.004}
        visible={false}
        raycast={() => undefined}
      />
      <mesh name="greenhouse" geometry={glassGeo} material={glassMat} raycast={() => undefined} />
      <pointLight position={[0.15, 0.95, 0]} intensity={1.8} distance={3.4} color="#f4f7ff" />
      <pointLight
        position={[0.45, 0.92, -0.15]}
        intensity={readShot() === "cabin" ? 6 : 1.6}
        distance={readShot() === "cabin" ? 2.6 : 1.5}
        decay={2}
        color="#e7ebf2"
      />
      <Lamps clip={clip} />
      <Mirrors material={mirrorPaint} clip={clip} />
      <Cabin
        plastic={plastic}
        carpet={carpet}
        pad={pad}
        padWell={padWell}
        cloth={clothMat}
        wheel={wheelMat}
        screen={screenMat}
        onComputer={onComputer}
        group={interior}
      />
    </group>
  );
}

function Lamps({ clip }: { clip: THREE.Plane[] }) {
  return (
    <group>
      {[0.62, -0.62].map((z) => (
        <group key={z} position={[2.08, 0.62, z]} rotation={[0, z > 0 ? -0.4 : 0.4, 0]}>
          <mesh position={[-0.02, 0, 0]} raycast={() => undefined}>
            <boxGeometry args={[0.12, 0.055, 0.42]} />
            <meshStandardMaterial color="#14171c" metalness={0.45} roughness={0.32} clippingPlanes={clip} />
          </mesh>
          <mesh position={[0.03, 0, 0]} raycast={() => undefined}>
            <boxGeometry args={[0.04, 0.028, 0.32]} />
            <meshStandardMaterial color="#dfe7f2" emissive="#f4f8ff" emissiveIntensity={0.7} clippingPlanes={clip} />
          </mesh>
        </group>
      ))}
      <mesh position={[-2.28, 0.78, 0]} raycast={() => undefined}>
        <boxGeometry args={[0.035, 0.028, 1.05]} />
        <meshStandardMaterial color="#3a1418" emissive="#ff3340" emissiveIntensity={0.45} clippingPlanes={clip} />
      </mesh>
      <mesh position={[2.12, 0.28, 0]} raycast={() => undefined}>
        <boxGeometry args={[0.08, 0.08, 1.2]} />
        <meshStandardMaterial color="#101216" roughness={0.55} metalness={0.25} clippingPlanes={clip} />
      </mesh>
      <mesh position={[-2.22, 0.82, 0.62]} rotation={[0, 0.4, Math.PI / 2]} raycast={() => undefined}>
        <cylinderGeometry args={[0.045, 0.045, 0.02, 20]} />
        <meshStandardMaterial color="#1a1d22" metalness={0.7} roughness={0.28} clippingPlanes={clip} />
      </mesh>
    </group>
  );
}

function Mirrors({ material, clip }: { material: THREE.Material; clip: THREE.Plane[] }) {
  return (
    <group>
      {[1, -1].map((side) => (
        <group key={side} position={[0.62, 1.02, side * 1.0]}>
          <mesh name="mirror-cap" rotation={[0, 0, Math.PI / 2]} material={material} raycast={() => undefined}>
            <capsuleGeometry args={[0.035, 0.12, 4, 8]} />
          </mesh>
          <mesh position={[0.02, 0, side * 0.08]} raycast={() => undefined}>
            <boxGeometry args={[0.08, 0.06, 0.1]} />
            <meshStandardMaterial color="#0e1218" roughness={0.15} metalness={0.4} clippingPlanes={clip} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
