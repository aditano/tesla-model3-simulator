import { Environment, Lightformer } from "@react-three/drei";
import * as THREE from "three";

const floor = new THREE.ShaderMaterial({
  uniforms: {
    uVoid: { value: new THREE.Color("#07080c") },
    uPool: { value: new THREE.Color("#171b24") },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    varying vec2 vUv;
    uniform vec3 uVoid;
    uniform vec3 uPool;
    void main() {
      float d = distance(vUv, vec2(0.5));
      float pool = smoothstep(0.42, 0.08, d);
      gl_FragColor = vec4(mix(uVoid, uPool, pool), 1.0);
    }
  `,
});

export function Studio() {
  return (
    <>
      <color attach="background" args={["#07080c"]} />
      <fog attach="fog" args={["#07080c", 12, 24]} />
      <hemisphereLight args={["#dfe7f5", "#07080c", 0.35]} />
      <directionalLight position={[4.5, 6.5, 2.5]} intensity={1.6} color="#fff8f2" />
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={5.5} position={[0, 4.2, 0.4]} rotation={[-Math.PI / 2, 0, 0]} scale={[8, 1.4, 1]} color="#fff6ee" />
        <Lightformer form="rect" intensity={4.2} position={[0.4, 2.4, 3.6]} rotation={[0.55, Math.PI, 0]} scale={[7, 0.22, 1]} color="#ffffff" />
        <Lightformer form="rect" intensity={2.2} position={[0.2, 1.35, 4.4]} rotation={[0, Math.PI, 0]} scale={[8, 1.4, 1]} color="#f3f6ff" />
        <Lightformer form="rect" intensity={1.4} position={[-0.6, 1.4, -4]} scale={[6, 1.1, 1]} color="#c9d4ee" />
        <Lightformer form="rect" intensity={3} position={[4.4, 1.5, 0.4]} rotation={[0, Math.PI / 2, 0]} scale={[0.8, 2.8, 1]} color="#ffffff" />
        <Lightformer form="rect" intensity={0.9} position={[-3.8, 0.9, -1]} rotation={[0, -Math.PI / 2, 0]} scale={[0.7, 2, 1]} color="#ffd8c2" />
      </Environment>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} material={floor}>
        <circleGeometry args={[14, 64]} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, 0]}>
        <circleGeometry args={[5.2, 64]} />
        <meshPhysicalMaterial color="#10141c" metalness={0.94} roughness={0.32} envMapIntensity={0.7} />
      </mesh>
    </>
  );
}
