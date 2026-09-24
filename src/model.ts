export type Mode =
  | "overview"
  | "inside"
  | "motor"
  | "battery"
  | "penthouse"
  | "cooling"
  | "computers";

export type SystemId = Exclude<Mode, "overview" | "inside">;

export const valves = [
  {
    id: "shed",
    label: "Radiator",
    lead: "Glycol takes heat from the pack and from the drive-unit oil exchanger, then hands it to the radiator.",
  },
  {
    id: "scavenge",
    label: "Warm pack",
    lead: "The radiator steps aside. Heat gathered in the powertrain oil is offered to the pack instead.",
  },
  {
    id: "cabin",
    label: "Cabin",
    lead: "The cabin branch lights. On this car a heat pump warms the people. There is no big resistive cabin heater in the drawing.",
  },
  {
    id: "charge",
    label: "Charging",
    lead: "Flow reverses. Tesla's octovalve patent describes a charging mode that can bypass the radiator, the drive units, or both. This position shows that bypass.",
  },
] as const;

export type ValveId = (typeof valves)[number]["id"];

export function valveById(id: ValveId) {
  const found = valves.find((valve) => valve.id === id);
  if (!found) {
    throw new Error(`Missing valve ${id}`);
  }
  return found;
}

export function valveIndex(id: ValveId): number {
  return valves.findIndex((valve) => valve.id === id);
}

export type SceneControl = {
  mode: Mode;
  motor: number;
  flow: number;
  soc: number;
  valve: ValveId;
  assist: number;
  reducedMotion: boolean;
};

export function emphasis(mode: Mode, id: SystemId): number {
  switch (mode) {
    case "overview":
      return 0;
    case "inside":
      return 0.62;
    case "motor":
    case "battery":
    case "penthouse":
    case "cooling":
    case "computers":
      return mode === id ? 1 : 0.14;
    default: {
      const neverMode: never = mode;
      return neverMode;
    }
  }
}

export function isOpen(mode: Mode): boolean {
  return mode !== "overview";
}

/** Tooth count published from one Weber State rear-drive teardown: (81/31)×(83/24). */
export const REAR_GEAR_RATIO = (81 / 31) * (83 / 24);

export function speedWord(value: number): string {
  if (value < 0.08) return "Still";
  if (value < 0.35) return "Easy";
  if (value < 0.7) return "Brisk";
  return "Fast";
}

export function flowWord(value: number): string {
  if (value < 0.08) return "Quiet";
  if (value < 0.4) return "Gentle";
  if (value < 0.75) return "Moving";
  return "Surging";
}

export function socFlowWord(soc: number): string {
  if (soc > 0.96) return "Stopped";
  if (soc > 0.8) return "Easing";
  if (soc > 0.45) return "Steady";
  return "Strong";
}

export function assistWord(value: number): string {
  if (value < 0.12) return "Quiet";
  if (value < 0.45) return "Awake";
  if (value < 0.75) return "Busy";
  return "Heavy";
}
