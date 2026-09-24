import { Environment, Lightformer } from "@react-three/drei";
import * as THREE from "three";

const floor = new THREE.ShaderMaterial({
  uniforms: {
    uTile: { value: new THREE.Color("#c9ced6") },
    uTileB: { value: new THREE.Color("#d5dae1") },
    uGrout: { value: new THREE.Color("#9aa1ab") },
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
      float tile = 0.62;
      vec2 id = floor(vWorld.xz / tile);
      vec2 f = fract(vWorld.xz / tile);
      float edge = min(min(f.x, 1.0 - f.x), min(f.y, 1.0 - f.y));
      float grout = 1.0 - smoothstep(0.012, 0.028, edge);
      vec3 ceramic = mix(uTile, uTileB, hash(id));
      vec3 color = mix(ceramic, uGrout, grout);
      float dist = length(vWorld.xz);
      float shadow = smoothstep(2.7, 0.85, dist);
      color *= mix(1.0, 0.62, shadow);
      float ring = smoothstep(0.018, 0.0, abs(dist - 2.35));
      color = mix(color, vec3(0.16, 0.17, 0.2), ring * 0.85);
      gl_FragColor = vec4(color, 1.0);
    }
  `,
});

export function Studio() {
  return (
    <>
      <color attach="background" args={["#141820"]} />
      <fog attach="fog" args={["#141820", 9, 20]} />
      <hemisphereLight args={["#f2f6fb", "#c5ccd6", 0.62]} />
      <directionalLight position={[5.5, 8.2, 3.2]} intensity={2.15} color="#fff7f0" />
      <directionalLight position={[-4.2, 3.2, -2.4]} intensity={0.35} color="#d7e2f4" />
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={4.2} position={[0, 5.2, 0.2]} rotation={[-Math.PI / 2, 0, 0]} scale={[9, 2.4, 1]} color="#fff8f2" />
        <Lightformer form="rect" intensity={3.4} position={[0.6, 2.6, 4.2]} rotation={[0.4, Math.PI, 0]} scale={[7, 0.28, 1]} color="#ffffff" />
        <Lightformer form="rect" intensity={1.6} position={[0.2, 1.6, 5]} rotation={[0, Math.PI, 0]} scale={[8, 1.6, 1]} color="#eef3fb" />
        <Lightformer form="rect" intensity={1.1} position={[-0.8, 1.8, -4.6]} scale={[7, 1.4, 1]} color="#c5d0e4" />
        <Lightformer form="rect" intensity={2.4} position={[5.2, 1.8, 0.2]} rotation={[0, Math.PI / 2, 0]} scale={[0.7, 3.2, 1]} color="#fff6ee" />
        <Lightformer form="rect" intensity={1.15} position={[-4.4, 1.2, -0.6]} rotation={[0, -Math.PI / 2, 0]} scale={[0.55, 2.2, 1]} color="#e7c39a" />
      </Environment>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} material={floor}>
        <planeGeometry args={[40, 40]} />
      </mesh>
    </>
  );
}
