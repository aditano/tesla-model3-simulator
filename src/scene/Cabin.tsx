import type { RefObject } from "react";
import type { ThreeEvent } from "@react-three/fiber";
import type * as THREE from "three";

/**
 * Schematic cabin: dark soft-trim, matte carpet, and dark charging pads.
 * These meshes never use the exterior paint material.
 */

export function Cabin({
  plastic,
  carpet,
  pad,
  padWell,
  cloth,
  wheel,
  screen,
  onComputer,
  group,
}: {
  plastic: THREE.Material;
  carpet: THREE.Material;
  pad: THREE.Material;
  padWell: THREE.Material;
  cloth: THREE.Material;
  wheel: THREE.Material;
  screen: THREE.Material;
  onComputer: () => void;
  group: RefObject<THREE.Group>;
}) {
  return (
    <group ref={group}>
      <mesh name="carpet" position={[0, 0.33, 0]} material={carpet} raycast={() => undefined}>
        <boxGeometry args={[1.9, 0.018, 1.42]} />
      </mesh>
      <mesh name="footwell-driver" position={[0.62, 0.352, 0.36]} material={carpet} raycast={() => undefined}>
        <boxGeometry args={[0.46, 0.012, 0.34]} />
      </mesh>
      <mesh name="footwell-passenger" position={[0.62, 0.352, -0.36]} material={carpet} raycast={() => undefined}>
        <boxGeometry args={[0.46, 0.012, 0.34]} />
      </mesh>

      <mesh name="headliner" position={[-0.08, 1.18, 0]} material={plastic} raycast={() => undefined}>
        <boxGeometry args={[1.65, 0.02, 1.2]} />
      </mesh>
      <mesh name="door-panel-driver" position={[0.02, 0.7, 0.78]} material={plastic} raycast={() => undefined}>
        <boxGeometry args={[1.55, 0.38, 0.028]} />
      </mesh>
      <mesh name="door-panel-passenger" position={[0.02, 0.7, -0.78]} material={plastic} raycast={() => undefined}>
        <boxGeometry args={[1.55, 0.38, 0.028]} />
      </mesh>

      <mesh name="instrument-panel" position={[0.8, 0.88, 0]} material={plastic} raycast={() => undefined}>
        <boxGeometry args={[0.34, 0.07, 1.4]} />
      </mesh>
      <mesh name="dash" position={[0.88, 0.66, 0]} material={plastic} raycast={() => undefined}>
        <boxGeometry args={[0.2, 0.26, 1.32]} />
      </mesh>
      <mesh name="console" position={[0.32, 0.44, 0]} material={plastic} raycast={() => undefined}>
        <boxGeometry args={[0.58, 0.16, 0.22]} />
      </mesh>

      <mesh name="charge-pad-well-driver" position={[0.46, 0.53, 0.05]} material={padWell} raycast={() => undefined}>
        <boxGeometry args={[0.2, 0.008, 0.13]} />
      </mesh>
      <mesh name="charge-pad-driver" position={[0.46, 0.546, 0.05]} material={pad} raycast={() => undefined}>
        <boxGeometry args={[0.17, 0.012, 0.1]} />
      </mesh>
      <mesh name="charge-pad-well-passenger" position={[0.46, 0.53, -0.05]} material={padWell} raycast={() => undefined}>
        <boxGeometry args={[0.2, 0.008, 0.13]} />
      </mesh>
      <mesh name="charge-pad-passenger" position={[0.46, 0.546, -0.05]} material={pad} raycast={() => undefined}>
        <boxGeometry args={[0.17, 0.012, 0.1]} />
      </mesh>

      <mesh name="seat-driver" position={[0.12, 0.55, 0.34]} material={cloth} raycast={() => undefined}>
        <boxGeometry args={[0.46, 0.42, 0.42]} />
      </mesh>
      <mesh name="seat-passenger" position={[0.12, 0.55, -0.34]} material={cloth} raycast={() => undefined}>
        <boxGeometry args={[0.46, 0.42, 0.42]} />
      </mesh>
      <mesh name="seat-rear" position={[-0.72, 0.58, 0]} material={cloth} raycast={() => undefined}>
        <boxGeometry args={[0.5, 0.4, 1.05]} />
      </mesh>

      <mesh
        name="steering-wheel"
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
        name="display"
        position={[0.6, 0.84, 0]}
        rotation={[0.08, 0, 0]}
        material={screen}
        onClick={(event: ThreeEvent<MouseEvent>) => {
          event.stopPropagation();
          onComputer();
        }}
      >
        <boxGeometry args={[0.02, 0.2, 0.14]} />
      </mesh>
    </group>
  );
}
