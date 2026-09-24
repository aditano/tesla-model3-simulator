import { Environment, Lightformer } from "@react-three/drei";
import * as THREE from "three";

const floor = new THREE.ShaderMaterial({
  uniforms: {
    uTile: { value: new THREE.Color("#b7bec8") },
    uTileB: { value: new THREE.Color("#c2c8d1") },
    uGrout: { value: new THREE.Color("#aeb5bf") },
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
    uniform vec3 uTile;
    uniform vec3 uTileB;
    uniform vec3 uGrout;
    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
    }
    void main() {
      float tile = 1.35;
      vec2 id = floor(vWorld.xz / tile);
      vec2 f = fract(vWorld.xz / tile);
      float edge = min(min(f.x, 1.0 - f.x), min(f.y, 1.0 - f.y));
      float grout = 1.0 - smoothstep(0.006, 0.02, edge);
      vec3 ceramic = mix(uTile, uTileB, hash(id) * 0.35);
      vec3 color = mix(ceramic, uGrout, grout * 0.28);
      float dist = length((vWorld.xz - vec2(0.1, 0.15)) * vec2(0.72, 1.0));
      float shadow = smoothstep(3.4, 1.15, dist);
      color *= mix(1.0, 0.72, shadow * shadow);
      float falloff = smoothstep(7.5, 14.0, length(vWorld.xz));
      color = mix(color, vec3(0.05, 0.06, 0.08), falloff);
      gl_FragColor = vec4(color, 1.0);
    }
  `,
});

export function Studio() {
  return (
    <>
      <color attach="background" args={["#07090e"]} />
      <fog attach="fog" args={["#07090e", 8, 18]} />
      <hemisphereLight args={["#8ea0b8", "#1a1e26", 0.32]} />
      <directionalLight position={[1.2, 8.4, 3.8]} intensity={0.9} color="#fff3e8" />
      <directionalLight position={[3.5, 2.4, 4.2]} intensity={0.18} color="#d5deea" />
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={1.35} position={[0.4, 4.8, 1.2]} rotation={[-Math.PI / 2, 0, 0.2]} scale={[5.5, 1.4, 1]} color="#fff6ee" />
        <Lightformer form="rect" intensity={0.7} position={[1.6, 3.1, 3.4]} rotation={[0.35, Math.PI, 0]} scale={[2.8, 0.35, 1]} color="#ffffff" />
        <Lightformer form="rect" intensity={0.35} position={[3.2, 1.4, -3.5]} scale={[4, 1.2, 1]} color="#9aabbe" />
        <Lightformer form="rect" intensity={0.45} position={[-4.2, 1.5, -1.2]} rotation={[0, -0.8, 0]} scale={[0.4, 1.6, 1]} color="#e7c9a2" />
      </Environment>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} material={floor}>
        <planeGeometry args={[40, 40]} />
      </mesh>
    </>
  );
}
