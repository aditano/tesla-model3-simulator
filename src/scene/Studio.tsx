import { ContactShadows, Environment, Lightformer } from "@react-three/drei";

export function Studio() {
  return (
    <>
      <color attach="background" args={["#090a0e"]} />
      <fog attach="fog" args={["#090a0e", 9, 22]} />
      <ambientLight intensity={0.25} />
      <directionalLight position={[4, 6, 3]} intensity={2.4} color="#fff6ee" />
      <directionalLight position={[-4, 2.5, -2]} intensity={0.7} color="#c9d4ff" />
      <spotLight position={[0, 5, 2]} intensity={12} angle={0.6} penumbra={0.8} color="#fffaf4" distance={18} />
      <Environment resolution={128}>
        <Lightformer intensity={3.2} position={[0, 3.2, 1]} scale={[8, 3, 1]} color="#fff4ea" />
        <Lightformer intensity={1.4} position={[-4, 1.5, -2]} scale={[4, 3, 1]} color="#c5d0ff" />
        <Lightformer intensity={0.8} position={[3, 1, 3]} scale={[2, 4, 1]} color="#ffe0c8" />
      </Environment>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <circleGeometry args={[8, 48]} />
        <meshStandardMaterial color="#101116" roughness={0.95} metalness={0.05} />
      </mesh>
      <ContactShadows position={[0, 0.001, 0]} opacity={0.45} scale={14} blur={2.6} far={4.2} />
    </>
  );
}
