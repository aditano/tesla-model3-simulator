import type { CSSProperties } from "react";
import type { Mode, ValveId } from "../model";
import { assistWord, flowWord, socFlowWord, speedWord, valves } from "../model";
import { lesson } from "../copy";
import { sourceById, sources, type SourceId } from "../sources";

const NAV: { id: Mode; label: string; key: string }[] = [
  { id: "overview", label: "Sealed", key: "0" },
  { id: "inside", label: "Open body", key: "B" },
  { id: "motor", label: "Motor", key: "1" },
  { id: "battery", label: "Pack", key: "2" },
  { id: "penthouse", label: "Penthouse", key: "3" },
  { id: "cooling", label: "Octovalve", key: "4" },
  { id: "computers", label: "Computers", key: "5" },
];

export function Hud({
  hidden,
  mode,
  motor,
  flow,
  soc,
  valve,
  assist,
  touched,
  deeper,
  sourcesOpen,
  onMode,
  onMotor,
  onFlow,
  onSoc,
  onValve,
  onAssist,
  onDeeper,
  onSources,
  onReset,
  onShow,
}: {
  hidden: boolean;
  mode: Mode;
  motor: number;
  flow: number;
  soc: number;
  valve: ValveId;
  assist: number;
  touched: boolean;
  deeper: boolean;
  sourcesOpen: boolean;
  onMode: (mode: Mode) => void;
  onMotor: (value: number) => void;
  onFlow: (value: number) => void;
  onSoc: (value: number) => void;
  onValve: (value: ValveId) => void;
  onAssist: (value: number) => void;
  onDeeper: (value: boolean) => void;
  onSources: (value: boolean) => void;
  onReset: () => void;
  onShow: () => void;
}) {
  const story = lesson(mode, valve);
  const accent = accentFor(mode);

  if (hidden) {
    return (
      <button type="button" className="show-ui" onClick={onShow}>
        Show the interface
      </button>
    );
  }

  const stats = chips(mode, motor, flow, soc, valve, assist);

  return (
    <>
      <header className="mast">
        <p className="brand">Unofficial schematic</p>
        <h1>
          Model 3
          <span>Systems</span>
        </h1>
        <p className="lede" aria-live="polite">
          {touched ? story.after : story.before}
        </p>
      </header>

      <div className="chips" aria-label="Live readouts">
        {stats.map((stat) => (
          <p key={stat.label}>
            <span>{stat.label}</span>
            <b>{stat.value}</b>
          </p>
        ))}
      </div>

      <aside className="glass" style={{ "--accent": accent } as CSSProperties}>
        <div className="glass-head">
          <p>{story.kicker}</p>
          <button type="button" className="icon" aria-expanded={deeper} aria-label="How this is drawn" onClick={() => onDeeper(!deeper)}>
            i
          </button>
        </div>
        <div className="seg-label">Body</div>
        <div className="segmented row" role="radiogroup" aria-label="Body">
          <button type="button" role="radio" aria-checked={mode === "overview"} className={mode === "overview" ? "on" : ""} onClick={() => onMode("overview")}>
            Assembled
          </button>
          <button type="button" role="radio" aria-checked={mode !== "overview"} className={mode !== "overview" ? "on" : ""} onClick={() => onMode(mode === "overview" ? "inside" : mode)}>
            Open
          </button>
        </div>
        <div className="seg-label">System</div>
        <div className="segmented systems" role="radiogroup" aria-label="System">
          {NAV.filter((item) => item.id !== "overview" && item.id !== "inside").map((item) => (
            <button
              key={item.id}
              type="button"
              role="radio"
              aria-checked={item.id === mode}
              className={item.id === mode ? "on" : ""}
              onClick={() => onMode(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
        <Control
          mode={mode}
          motor={motor}
          flow={flow}
          soc={soc}
          valve={valve}
          assist={assist}
          onMotor={onMotor}
          onFlow={onFlow}
          onSoc={onSoc}
          onValve={onValve}
          onAssist={onAssist}
        />
        <div className="glass-foot">
          <button type="button" className="text-btn" onClick={() => onSources(true)}>
            Sources
          </button>
          <button type="button" className="text-btn" onClick={onReset}>
            Reset view
          </button>
        </div>
      </aside>

      <nav className="film" aria-label="Systems">
        {NAV.map((item) => (
          <button
            key={item.id}
            type="button"
            className={item.id === mode ? "frame on" : "frame"}
            aria-pressed={item.id === mode}
            onClick={() => onMode(item.id)}
          >
            <i style={{ background: accentFor(item.id) }} />
            <span>{item.label}</span>
            <kbd>{item.key}</kbd>
          </button>
        ))}
      </nav>

      <p className="schematic">{mode === "overview" ? "Silhouette, not a factory surface" : "Schematic, not to scale"}</p>

      {deeper ? (
        <div className="sources" role="dialog" aria-modal="true" aria-labelledby="lesson-title">
          <div className="sources-card">
            <header>
              <h2 id="lesson-title">{story.title}</h2>
              <button type="button" className="ghost" onClick={() => onDeeper(false)}>
                Close
              </button>
            </header>
            <p className="lede tight">{touched ? story.after : story.before}</p>
            {story.deeper.map((note) => (
              <section key={note.heading} className="deeper">
                <h2>{note.heading}</h2>
                <p>{note.body}</p>
                <p className="cites">
                  {note.sources.map((id) => (
                    <Cite key={id} id={id} />
                  ))}
                </p>
              </section>
            ))}
          </div>
        </div>
      ) : null}

      {sourcesOpen ? (
        <div className="sources" role="dialog" aria-modal="true" aria-labelledby="sources-title">
          <div className="sources-card">
            <header>
              <h2 id="sources-title">Sources</h2>
              <button type="button" className="ghost" onClick={() => onSources(false)}>
                Close
              </button>
            </header>
            <p className="lede tight">
              Every major claim in the notes is tied to a teardown, a Tesla patent, or a service procedure. Geometry that is not in those sources is labeled schematic.
            </p>
            <ul>
              {sources.map((item) => (
                <li key={item.id}>
                  <a href={item.url} target="_blank" rel="noreferrer">
                    {item.title}
                  </a>
                  <p>{item.supports}</p>
                </li>
              ))}
            </ul>
            <p className="disclaimer">
              Unofficial classroom model. Not affiliated with Tesla, Inc. The body is an original silhouette for orientation, not a licensed surface.
            </p>
          </div>
        </div>
      ) : null}
    </>
  );
}

function Cite({ id }: { id: SourceId }) {
  const item = sourceById(id);
  return (
    <a href={item.url} target="_blank" rel="noreferrer">
      {item.short}
    </a>
  );
}

function Control({
  mode,
  motor,
  flow,
  soc,
  valve,
  assist,
  onMotor,
  onFlow,
  onSoc,
  onValve,
  onAssist,
}: {
  mode: Mode;
  motor: number;
  flow: number;
  soc: number;
  valve: ValveId;
  assist: number;
  onMotor: (value: number) => void;
  onFlow: (value: number) => void;
  onSoc: (value: number) => void;
  onValve: (value: ValveId) => void;
  onAssist: (value: number) => void;
}) {
  switch (mode) {
    case "overview":
      return <p className="hint">Drag to orbit. Open the body, then pick a system.</p>;
    case "inside":
      return <p className="hint">Click a label on the car, or choose a system.</p>;
    case "motor":
      return <Slider label="Rotor" value={motor} minLabel="Still" maxLabel="Fast" onChange={onMotor} />;
    case "battery":
      return <Slider label="Charge rate" value={flow} minLabel="Quiet" maxLabel="Surging" onChange={onFlow} />;
    case "penthouse":
      return <Slider label="State of charge" value={soc} minLabel="Empty" maxLabel="Full" onChange={onSoc} />;
    case "cooling":
      return (
        <div className="segmented" role="radiogroup" aria-label="Octovalve position">
          {valves.map((item) => (
            <button
              key={item.id}
              type="button"
              role="radio"
              aria-checked={item.id === valve}
              className={item.id === valve ? "on" : ""}
              onClick={() => onValve(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      );
    case "computers":
      return <Slider label="Driver assistance" value={assist} minLabel="Quiet" maxLabel="Heavy" onChange={onAssist} />;
    default: {
      const neverMode: never = mode;
      return neverMode;
    }
  }
}

function Slider({
  label,
  value,
  minLabel,
  maxLabel,
  onChange,
}: {
  label: string;
  value: number;
  minLabel: string;
  maxLabel: string;
  onChange: (value: number) => void;
}) {
  return (
    <label className="slider">
      <span>{label}</span>
      <input
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={value}
        aria-valuetext={value.toFixed(2)}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      <span className="ends">
        <i>{minLabel}</i>
        <i>{maxLabel}</i>
      </span>
    </label>
  );
}

function chips(
  mode: Mode,
  motor: number,
  flow: number,
  soc: number,
  valve: ValveId,
  assist: number,
): { label: string; value: string }[] {
  switch (mode) {
    case "overview":
      return [
        { label: "Body", value: "Sealed" },
        { label: "Drive", value: "Rear" },
        { label: "Pack", value: "2170" },
      ];
    case "inside":
      return [
        { label: "Body", value: "Open" },
        { label: "Shell", value: "Glass" },
        { label: "Scale", value: "Schematic" },
      ];
    case "motor":
      return [
        { label: "Rotor", value: speedWord(motor) },
        { label: "Field", value: motor < 0.08 ? "Quiet" : "Locked" },
        { label: "Rear wheel", value: motor < 0.08 ? "Still" : "Slower" },
      ];
    case "battery":
      return [
        { label: "Charge", value: flowWord(flow) },
        { label: "Cells", value: flow < 0.08 ? "Resting" : "Filling" },
        { label: "Pack", value: "2170" },
      ];
    case "penthouse":
      return [
        { label: "Charge", value: `${Math.round(soc * 100)}%` },
        { label: "Incoming", value: socFlowWord(soc) },
        { label: "Path", value: "AC to DC" },
      ];
    case "cooling":
      return [
        { label: "Valve", value: valves.find((item) => item.id === valve)?.label ?? valve },
        { label: "Glycol", value: "Blue" },
        { label: "Stator oil", value: "Amber" },
      ];
    case "computers":
      return [
        { label: "Cameras", value: assistWord(assist) },
        { label: "Coolant", value: assist < 0.2 ? "Calm" : "Moving" },
        { label: "Module", value: "Bulkhead" },
      ];
    default: {
      const neverMode: never = mode;
      return neverMode;
    }
  }
}

function accentFor(mode: Mode): string {
  switch (mode) {
    case "overview":
    case "inside":
      return "#f4f1ea";
    case "motor":
      return "#e7a36a";
    case "battery":
      return "#8ef0c4";
    case "penthouse":
      return "#f0d2a8";
    case "cooling":
      return "#8fd4ff";
    case "computers":
      return "#c3b6ff";
    default: {
      const neverMode: never = mode;
      return neverMode;
    }
  }
}
