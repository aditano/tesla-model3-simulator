import { Suspense, useEffect, useRef, type MutableRefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Bloom, DepthOfField, EffectComposer, Vignette } from "@react-three/postprocessing";
import type { DepthOfFieldEffect } from "postprocessing";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import type { Mode, SceneControl } from "../model";
import { REAR_GEAR_RATIO } from "../model";
import { POSE } from "./layout";
import { Studio } from "./Studio";
import { Body } from "./Body";
import { Wheels } from "./Wheels";
import { Motor } from "./Motor";
import { Battery } from "./Battery";
import { Penthouse } from "./Penthouse";
import { Cooling } from "./Cooling";
import { Computers } from "./Computers";
import { Callouts } from "./Callouts";

function Drivetrain({
  control,
  spin,
}: {
  control: SceneControl;
  spin: MutableRefObject<{ rotor: number; wheel: number }>;
}) {
  useFrame((_, dt) => {
    if (control.mode !== "motor") return;
    if (control.reducedMotion) {
      spin.current.rotor = control.motor * Math.PI * 2;
    } else {
      spin.current.rotor += control.motor * dt * 8;
    }
    spin.current.wheel = spin.current.rotor / REAR_GEAR_RATIO;
  });
  return null;
}

function CameraRig({ mode, resetToken }: { mode: Mode; resetToken: number }) {
  const camera = useThree((state) => state.camera);
  const controls = useThree((state) => state.controls) as OrbitControlsImpl | null;
  const touched = useRef(false);
  const pending = useRef(true);
  const anim = useRef({
    t: 1,
    fromP: new THREE.Vector3(),
    toP: new THREE.Vector3(),
    fromT: new THREE.Vector3(),
    toT: new THREE.Vector3(),
  });

  useEffect(() => {
    pending.current = true;
  }, [mode, resetToken]);

  useFrame((_, dt) => {
    if (!controls) return;
    if (pending.current) {
      pending.current = false;
      const pose = POSE[mode];
      anim.current.t = 0;
      anim.current.fromP.copy(camera.position);
      anim.current.toP.set(...pose.pos);
      anim.current.fromT.copy(controls.target);
      anim.current.toT.set(...pose.target);
    }
    if (anim.current.t >= 1) return;
    anim.current.t = Math.min(1, anim.current.t + dt / 1.1);
    const k = 1 - (1 - anim.current.t) ** 3;
    camera.position.lerpVectors(anim.current.fromP, anim.current.toP, k);
    controls.target.lerpVectors(anim.current.fromT, anim.current.toT, k);
    controls.update();
  });

  return (
    <OrbitControls
      makeDefault
      enableDamping
      dampingFactor={0.08}
      enablePan
      minDistance={0.7}
      maxDistance={9.5}
      maxPolarAngle={Math.PI / 2 - 0.04}
      minPolarAngle={0.28}
      autoRotate={mode === "overview" && !touched.current}
      autoRotateSpeed={0.45}
      onStart={() => {
        touched.current = true;
        anim.current.t = 1;
        if (controls) controls.autoRotate = false;
      }}
    />
  );
}

function StudioFocus() {
  const effect = useRef<DepthOfFieldEffect>(null);
  const camera = useThree((state) => state.camera);
  const controls = useThree((state) => state.controls) as OrbitControlsImpl | null;
  const aim = useRef(new THREE.Vector3());

  useFrame(() => {
    const dof = effect.current;
    if (!dof || !controls) return;
    aim.current.copy(controls.target);
    dof.target = aim.current;
    const dist = camera.position.distanceTo(aim.current);
    dof.cocMaterial.focusRange = Math.max(1.45, dist * 0.4);
  });

  return <DepthOfField ref={effect} bokehScale={1.7} resolutionScale={0.55} focusDistance={4} focusRange={1.8} />;
}

function SceneContents({
  control,
  resetToken,
  onSelect,
}: {
  control: SceneControl;
  resetToken: number;
  onSelect: (mode: Mode) => void;
}) {
  const spin = useRef({ rotor: 0, wheel: 0 });

  return (
    <>
      <Studio />
      <Drivetrain control={control} spin={spin} />
      <Body mode={control.mode} onOpen={() => onSelect("inside")} onComputer={() => onSelect("computers")} />
      <Wheels spin={spin} />
      <Motor mode={control.mode} motor={control.motor} spin={spin} onSelect={() => onSelect("motor")} />
      <Battery mode={control.mode} flow={control.flow} soc={control.soc} onSelect={() => onSelect("battery")} />
      <Penthouse mode={control.mode} soc={control.soc} onSelect={() => onSelect("penthouse")} />
      <Cooling mode={control.mode} valve={control.valve} assist={control.assist} onSelect={() => onSelect("cooling")} />
      <Computers mode={control.mode} assist={control.assist} onSelect={() => onSelect("computers")} />
      <Callouts mode={control.mode} onSelect={onSelect} />
      <CameraRig mode={control.mode} resetToken={resetToken} />
      <EffectComposer multisampling={0} enableNormalPass={false}>
        <StudioFocus />
        <Bloom luminanceThreshold={1.05} mipmapBlur intensity={0.12} radius={0.3} />
        <Vignette eskil={false} offset={0.32} darkness={0.62} />
      </EffectComposer>
    </>
  );
}

export function CarScene({
  control,
  resetToken,
  onSelect,
}: {
  control: SceneControl;
  resetToken: number;
  onSelect: (mode: Mode) => void;
}) {
  const pose = POSE.overview;
  return (
    <Canvas
      camera={{ position: pose.pos, fov: 28, near: 0.05, far: 50 }}
      dpr={[1, 1.6]}
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 0.9;
      }}
    >
      <Suspense fallback={null}>
        <SceneContents control={control} resetToken={resetToken} onSelect={onSelect} />
      </Suspense>
    </Canvas>
  );
}
