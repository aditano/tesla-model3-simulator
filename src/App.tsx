import { useEffect, useState } from "react";
import { CarScene } from "./scene/CarScene";
import { Hud } from "./ui/Hud";
import type { Mode, ValveId } from "./model";
import { valveIndex, valves } from "./model";
import { readShot } from "./scene/layout";

function clamp(value: number): number {
  return Math.min(1, Math.max(0, value));
}

export function App() {
  const [mode, setMode] = useState<Mode>("overview");
  const [motor, setMotor] = useState(0.28);
  const [flow, setFlow] = useState(0.35);
  const [soc, setSoc] = useState(0.42);
  const [valve, setValve] = useState<ValveId>("shed");
  const [assist, setAssist] = useState(0.22);
  const [touched, setTouched] = useState<Partial<Record<Mode, boolean>>>({});
  const [deeper, setDeeper] = useState(false);
  const [sourcesOpen, setSourcesOpen] = useState(false);
  const [hidden, setHidden] = useState(() => readShot() !== null);
  const [resetToken, setResetToken] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [booting, setBooting] = useState(() => readShot() === null);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReducedMotion(media.matches);
    apply();
    media.addEventListener("change", apply);
    const timer = window.setTimeout(() => setBooting(false), 900);
    return () => {
      media.removeEventListener("change", apply);
      window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    setDeeper(false);
  }, [mode]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target;
      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) return;
      const key = event.key.toLowerCase();
      const jump: Record<string, Mode> = {
        "0": "overview",
        "1": "motor",
        "2": "battery",
        "3": "penthouse",
        "4": "cooling",
        "5": "computers",
        b: "inside",
      };
      if (jump[key]) {
        setMode(jump[key]);
        return;
      }
      if (event.key === "/") {
        event.preventDefault();
        setHidden((value) => !value);
        return;
      }
      if (key === "r") {
        setResetToken((value) => value + 1);
        return;
      }
      if (event.key === "Escape") {
        if (sourcesOpen) setSourcesOpen(false);
        else if (deeper) setDeeper(false);
        else if (mode !== "overview" && mode !== "inside") setMode("inside");
        else if (mode === "inside") setMode("overview");
        return;
      }
      if (event.key === "[" || event.key === "]") {
        const direction = event.key === "]" ? 0.04 : -0.04;
        mark(mode);
        if (mode === "motor") setMotor((value) => clamp(value + direction));
        if (mode === "battery") setFlow((value) => clamp(value + direction));
        if (mode === "penthouse") setSoc((value) => clamp(value + direction));
        if (mode === "computers") setAssist((value) => clamp(value + direction));
        if (mode === "cooling") {
          const next = (valveIndex(valve) + (direction > 0 ? 1 : valves.length - 1)) % valves.length;
          const picked = valves[next];
          if (picked) setValve(picked.id);
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [deeper, mode, sourcesOpen, valve]);

  const mark = (next: Mode) => setTouched((current) => ({ ...current, [next]: true }));

  return (
    <main>
      <CarScene
        control={{ mode, motor, flow, soc, valve, assist, reducedMotion }}
        resetToken={resetToken}
        onSelect={(next) => {
          setMode(next);
          if (next !== "overview") mark("overview");
        }}
      />
      <Hud
        hidden={hidden}
        mode={mode}
        motor={motor}
        flow={flow}
        soc={soc}
        valve={valve}
        assist={assist}
        touched={Boolean(touched[mode])}
        deeper={deeper}
        sourcesOpen={sourcesOpen}
        onMode={setMode}
        onMotor={(value) => {
          mark("motor");
          setMotor(value);
        }}
        onFlow={(value) => {
          mark("battery");
          setFlow(value);
        }}
        onSoc={(value) => {
          mark("penthouse");
          setSoc(value);
        }}
        onValve={(value) => {
          mark("cooling");
          setValve(value);
        }}
        onAssist={(value) => {
          mark("computers");
          setAssist(value);
        }}
        onDeeper={setDeeper}
        onSources={setSourcesOpen}
        onReset={() => setResetToken((value) => value + 1)}
        onShow={() => setHidden(false)}
      />
      <div className={booting ? "veil" : "veil off"} aria-hidden={!booting}>
        Opening the shell…
      </div>
    </main>
  );
}
