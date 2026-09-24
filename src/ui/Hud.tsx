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

  return (
    <>
      <div className="panel" style={{ "--accent": accent } as CSSProperties}>
        <div className="block">
          <p className="brand">Model 3 · unofficial schematic</p>
          <p className="kicker">{story.kicker}</p>
          <h1>{story.title}</h1>
          <p className="lede" aria-live="polite">
            {touched ? story.after : story.before}
          </p>
          <Control
            mode={mode}
            motor={motor}
            flow={flow}
            soc={soc}
            valve={valve}
            assist={assist}
            onMode={onMode}
            onMotor={onMotor}
            onFlow={onFlow}
            onSoc={onSoc}
            onValve={onValve}
            onAssist={onAssist}
          />
          <Readout mode={mode} motor={motor} flow={flow} soc={soc} valve={valve} assist={assist} />
          <nav className="nav" aria-label="Systems">
            {NAV.map((item) => (
              <button
                key={item.id}
                type="button"
                className={item.id === mode ? "nav-item on" : "nav-item"}
                aria-pressed={item.id === mode}
                onClick={() => onMode(item.id)}
              >
                <span>{item.label}</span>
                <kbd>{item.key}</kbd>
              </button>
            ))}
          </nav>
          <button type="button" className="text-btn" aria-expanded={deeper} onClick={() => onDeeper(!deeper)}>
            {deeper ? "Hide the notes" : "Why it’s drawn this way"}
          </button>
          {deeper ? (
            <div className="deeper">
              {story.deeper.map((note) => (
                <section key={note.heading}>
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
          ) : null}
        </div>
      </div>

      <div className="chrome">
        <button type="button" className="ghost" onClick={() => onSources(true)}>
          Sources
        </button>
        <button type="button" className="ghost" onClick={onReset}>
          Reset view
        </button>
      </div>

      <p className="schematic">{mode === "overview" ? "Silhouette, not a factory surface" : "Schematic, not to scale"}</p>
      <p className="keys">
        Drag orbit · pinch zoom · 0–5 systems · [ ] nudge · R reset · / hide
      </p>

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
  onMode,
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
  onMode: (mode: Mode) => void;
  onMotor: (value: number) => void;
  onFlow: (value: number) => void;
  onSoc: (value: number) => void;
  onValve: (value: ValveId) => void;
  onAssist: (value: number) => void;
}) {
  switch (mode) {
    case "overview":
      return (
        <button type="button" className="primary" onClick={() => onMode("inside")}>
          Make the body transparent
        </button>
      );
    case "inside":
      return <p className="hint">Choose a system below, or click a label on the car.</p>;
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

function Readout({
  mode,
  motor,
  flow,
  soc,
  valve,
  assist,
}: {
  mode: Mode;
  motor: number;
  flow: number;
  soc: number;
  valve: ValveId;
  assist: number;
}) {
  switch (mode) {
    case "overview":
    case "inside":
      return null;
    case "motor":
      return (
        <div className="readout">
          <Stat label="Rotor" value={speedWord(motor)} />
          <Stat label="Field" value={motor < 0.08 ? "Quiet" : "Locked"} />
          <Stat label="Rear wheel" value={motor < 0.08 ? "Still" : "Slower"} />
        </div>
      );
    case "battery":
      return (
        <div className="readout">
          <Stat label="Collectors" value={flowWord(flow)} />
          <Stat label="Cells" value={flow < 0.08 ? "Resting" : "Filling"} />
        </div>
      );
    case "penthouse":
      return (
        <div className="readout">
          <Stat label="State of charge" value={`${Math.round(soc * 100)}%`} />
          <Stat label="Incoming flow" value={socFlowWord(soc)} />
        </div>
      );
    case "cooling":
      return (
        <div className="readout">
          <Stat label="Valve" value={valves.find((item) => item.id === valve)?.label ?? valve} />
          <Stat label="Glycol" value="Blue" />
          <Stat label="Stator oil" value="Amber" />
        </div>
      );
    case "computers":
      return (
        <div className="readout">
          <Stat label="Cameras" value={assistWord(assist)} />
          <Stat label="Computer coolant" value={assist < 0.2 ? "Calm" : "Moving"} />
        </div>
      );
    default: {
      const neverMode: never = mode;
      return neverMode;
    }
  }
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <p>
      <span>{label}</span>
      <b>{value}</b>
    </p>
  );
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
