import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Vec3 } from "./layout";

function dashTexture(hex: string): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 32;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Could not draw the flow texture.");
  }
  ctx.clearRect(0, 0, 256, 32);
  ctx.fillStyle = hex;
  ctx.globalAlpha = 0.28;
  ctx.fillRect(0, 10, 256, 12);
  ctx.globalAlpha = 1;
  const fade = ctx.createLinearGradient(0, 0, 96, 0);
  fade.addColorStop(0, "rgba(255,255,255,0)");
  fade.addColorStop(0.45, hex);
  fade.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = fade;
  ctx.fillRect(8, 4, 96, 24);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function FlowTube({
  points,
  color,
  radius = 0.016,
  speed = 0.45,
  gain = 1,
}: {
  points: readonly Vec3[];
  color: string;
  radius?: number;
  speed?: number;
  gain?: number;
}) {
  const map = useMemo(() => dashTexture(color), [color]);
  const curve = useMemo(
    () => new THREE.CatmullRomCurve3(points.map((point) => new THREE.Vector3(...point))),
    [points],
  );
  const material = useRef<THREE.MeshStandardMaterial>(null);

  useFrame((_, dt) => {
    map.offset.x = (map.offset.x - dt * speed) % 1;
    if (material.current) {
      material.current.opacity = Math.max(0, Math.min(0.85, gain));
      material.current.emissiveIntensity = 0.2 + gain * 0.9;
    }
  });

  return (
    <mesh>
      <tubeGeometry args={[curve, 64, radius, 8, false]} />
      <meshStandardMaterial
        ref={material}
        color={color}
        map={map}
        emissive={color}
        emissiveMap={map}
        emissiveIntensity={0.6}
        roughness={0.4}
        metalness={0.05}
        transparent
        opacity={Math.min(0.85, gain)}
        depthWrite={false}
      />
    </mesh>
  );
}
