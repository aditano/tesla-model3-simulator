import { Environment, Lightformer, MeshReflectorMaterial } from "@react-three/drei";
import * as THREE from "three";
import { FRONT_X, HALF_TRACK, REAR_X } from "./layout";

const tiles = (() => {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.Texture();
  ctx.fillStyle = "#e4e8ed";
  ctx.fillRect(0, 0, 128, 128);
  ctx.fillStyle = "rgba(255,255,255,0.045)";
  ctx.fillRect(10, 14, 46, 38);
  ctx.fillStyle = "rgba(0,0,0,0.035)";
  ctx.fillRect(70, 72, 40, 34);
  ctx.strokeStyle = "#a7adb6";
  ctx.lineWidth = 3;
  ctx.strokeRect(1.5, 1.5, 125, 125);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(22.2, 22.2);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
})();

const veil = new THREE.ShaderMaterial({
  transparent: true,
  depthWrite: false,
  uniforms: {
    uFront: { value: FRONT_X },
    uRear: { value: REAR_X },
    uTrack: { value: HALF_TRACK },
  },
  vertexShader: `
    varying vec3 vWorld;
    void main() {
      vec4 world = modelMatrix * vec4(position, 1.0);
      vWorld = world.xyz;
      gl_Position = projectionMatrix * viewMatrix * world;
    }
  `,
  fragmentShader: `
    varying vec3 vWorld;
    uniform float uFront;
    uniform float uRear;
    uniform float uTrack;
    float wheel(vec2 center) {
      vec2 d = (vWorld.xz - center) * vec2(1.45, 2.35);
      return smoothstep(0.46, 0.04, length(d));
    }
    void main() {
      float shade = 0.0;
      shade = max(shade, wheel(vec2(uFront, uTrack)));
      shade = max(shade, wheel(vec2(uFront, -uTrack)));
      shade = max(shade, wheel(vec2(uRear, uTrack)));
      shade = max(shade, wheel(vec2(uRear, -uTrack)));
      vec2 body = (vWorld.xz - vec2(-0.05, 0.0)) * vec2(0.38, 1.05);
      shade = max(shade, smoothstep(1.25, 0.15, length(body)) * 0.72);
      float falloff = smoothstep(8.8, 16.0, length(vWorld.xz));
      float alpha = max(shade * 0.62, falloff);
      vec3 tint = mix(vec3(0.015, 0.018, 0.022), vec3(0.027, 0.035, 0.047), falloff);
      gl_FragColor = vec4(tint, alpha);
    }
  `,
});

export function Studio() {
  return (
    <>
      <color attach="background" args={["#07090e"]} />
      <fog attach="fog" args={["#07090e", 9, 20]} />
      <hemisphereLight args={["#d5dee8", "#1c212a", 0.5]} />
      <directionalLight position={[1.4, 6.8, 2.8]} intensity={1.15} color="#fff6ee" />
      <directionalLight position={[2.4, 2.8, 5.2]} intensity={0.38} color="#e7eef8" />
      <Environment resolution={512} frames={1}>
        <Lightformer form="rect" intensity={3.6} position={[0.2, 4.6, 0.15]} rotation={[-Math.PI / 2, 0, 0.04]} scale={[8.4, 0.16, 1]} color="#fff8f3" />
        <Lightformer form="rect" intensity={2.1} position={[0.15, 1.85, 3.6]} rotation={[0.2, Math.PI, 0]} scale={[7.2, 0.22, 1]} color="#ffffff" />
        <Lightformer form="rect" intensity={0.55} position={[0.1, 1.7, -3.8]} rotation={[0.15, 0, 0]} scale={[6.4, 0.45, 1]} color="#8ea6bf" />
        <Lightformer form="rect" intensity={0.85} position={[-4.6, 1.45, 0.2]} rotation={[0, Math.PI / 2, 0]} scale={[0.28, 2.4, 1]} color="#f0c8a4" />
        <Lightformer form="rect" intensity={0.4} position={[4.8, 1.3, 1.4]} rotation={[0, -Math.PI / 2, 0]} scale={[0.22, 1.6, 1]} color="#e7eef6" />
      </Environment>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[30, 30]} />
        <MeshReflectorMaterial
          map={tiles}
          color="#ffffff"
          roughness={0.84}
          metalness={0.06}
          envMapIntensity={0.2}
          blur={[480, 160]}
          resolution={512}
          mixBlur={1}
          mixStrength={0.14}
          mirror={0.04}
          minDepthThreshold={0.25}
          maxDepthThreshold={1.15}
          depthScale={0.55}
        />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0]} material={veil} raycast={() => undefined}>
        <planeGeometry args={[30, 30]} />
      </mesh>
    </>
  );
}
