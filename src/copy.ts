import type { Mode, ValveId } from "./model";
import { valveById } from "./model";
import type { SourceId } from "./sources";

export type Deeper = {
  heading: string;
  body: string;
  sources: readonly SourceId[];
};

export type Lesson = {
  kicker: string;
  title: string;
  before: string;
  after: string;
  deeper: readonly Deeper[];
};

const packDeeper: Deeper = {
  heading: "What “structural” means here",
  body: "The long-range pack is four modules of 2170 cells, bolted up through the cabin floor so the case is part of the floor structure. Tesla’s later structural battery is a different object: 4680 cells bonded between face sheets, with the modules deleted. That pack was shown at Battery Day and tore down on a Model Y, not as this Model 3. Module positions on the floor are approximate. Cooling gaps and wire bonds are drawn wide, and the highlighted cluster is only part of a 46-cell parallel group.",
  sources: ["hughes", "electrek-pack", "motortrend", "battery-day", "musk-battery-day", "insideevs-4680"],
};

export function lesson(mode: Mode, valve: ValveId): Lesson {
  switch (mode) {
    case "overview":
      return {
        kicker: "Closed",
        title: "A Model 3, still sealed.",
        before: "Drag to orbit it. The body is a silhouette so the parts inside can stay honest.",
        after: "Open the body when you want the systems. The paint is only there to keep front and back obvious.",
        deeper: [
          {
            heading: "Which car this is",
            body: "A heat-pump Model 3 with the long-range 2170 pack: rear permanent-magnet drive unit, octovalve on the front supermanifold, and a liquid-cooled car computer on the passenger bulkhead. Early cars used a superbottle and a resistive cabin heater instead of this valve. Chip generations changed later. None of those variants are mixed into the picture.",
            sources: ["electrek-pack", "service-octo", "service-computer", "insideevs-cooling"],
          },
        ],
      };
    case "inside":
      return {
        kicker: "Opened",
        title: "The shell steps back.",
        before: "The outline stays so you can still tell which way is forward. Pick a system, or click a part.",
        after: "Each view has one control. Move it and watch the part answer.",
        deeper: [packDeeper],
      };
    case "motor":
      return {
        kicker: "Rear drive unit",
        title: "The field and the rotor turn together.",
        before: "Drag the rotor. This is the rear motor, the one with buried magnets.",
        after: "The violet ribbons stay locked to the rotor. The copper brightens because that work makes heat. Oil inside the housing carries the heat away — glycol never touches these windings. The rear wheel turns much more slowly than the rotor.",
        deeper: [
          {
            heading: "What was left out on purpose",
            body: "Teardowns describe an interior permanent-magnet synchronous reluctance motor, oil fed through the stator, with an oil-to-glycol exchanger and the inverter bolted to the housing. Dual-motor cars add a smaller induction motor on the front axle. Slot count, magnet count, and the ribbon shape are a classroom picture, not a measured field. One published gear set was about nine rotor turns per wheel turn.",
            sources: ["weber", "insideevs-motor", "munro-oil", "marklines", "vasa"],
          },
        ],
      };
    case "battery":
      return {
        kicker: "Long-range pack",
        title: "Cells, collectors, and a floor that works.",
        before: "Drag the charge rate. The opened module is a stand-in for the pattern, not all 4,416 cells.",
        after: "Charge runs along the collectors and into the cells. The blue ribs are coolant channels between the rows. They are drawn wide so you can see them.",
        deeper: [
          packDeeper,
          {
            heading: "How the cells are grouped",
            body: "A long-range group is 46 cells in parallel, tied with ultrasonic wire bonds to an aluminum collector. Groups stack in series: two modules of 23 and two of 25, which is 96 groups. The bonds you see are a few strands of that idea. A magazine account swapped the words “series” and “parallel”; the count used here is the 96-by-46 arrangement.",
            sources: ["hughes", "motortrend", "electrek-pack"],
          },
        ],
      };
    case "penthouse":
      return {
        kicker: "Pack electronics",
        title: "Wall power becomes pack power.",
        before: "This meter is how full the pack is. Drag it and watch the rear of the pack.",
        after: "AC comes in at the charge port. The onboard charger in the penthouse turns it into DC for the cells. As the meter fills, that incoming flow eases off. The same housing also holds the contactors, the pyro disconnect, and the high-voltage controller.",
        deeper: [
          {
            heading: "AC charging, not a Supercharger",
            body: "The penthouse combines the onboard charger and the DC-DC converter. DC fast charge uses a separate contactor and skips the onboard charger — that path is not the one moving here. The boxes are labeled jobs, not photographed parts, and the cables are a single-line diagram.",
            sources: ["electrek-pack", "insideevs-cooling", "service-penthouse"],
          },
        ],
      };
    case "cooling":
      return {
        kicker: "Heat pump",
        title: "One valve, several errands.",
        before: "The octovalve sits on the supermanifold, up front. Turn it.",
        after: valveById(valve).lead,
        deeper: [
          {
            heading: "Schematic routes, real parts",
            body: "Tesla’s octovalve patent shows eight ports facing one way, in two rows of four, and a stemshell that a controller rotates. The ports serve the battery, radiator, chiller, and powertrain. A charging mode can reverse flow and bypass the radiator and/or the drive units. The hoses in this view are a classroom map of those visits, not the patent’s port-by-port diagram. The chiller and liquid-cooled condenser are not drawn pipe for pipe. Early Model 3 cars did this job with a four-way valve on the superbottle instead.",
            sources: ["patent-octo", "service-octo", "patent-valve", "insideevs-cooling", "ingineerix", "munro-oil"],
          },
        ],
      };
    case "computers":
      return {
        kicker: "Onboard computers",
        title: "Assistance warms one box.",
        before: "The car computer is on the passenger side of the firewall. Drag driver-assistance load.",
        after: "The cameras and the glow inside that module brighten together, and so does the coolant branch that serves it. The calm cables are a different job: pack DC into the inverters, then three-phase AC into the motors, drawn here as one line.",
        deeper: [
          {
            heading: "One module, two jobs, moving chips",
            body: "Service procedures mount a liquid-cooled car computer on the passenger bulkhead, separate from the drive inverters. Early cars put infotainment and Autopilot on two boards in that module. Later cars changed the chips, including the Hardware 3 computer and, on some cars, a different infotainment board. This view does not label a processor, and it does not assign which face of the box is which. Camera and harness positions are schematic.",
            sources: ["service-computer", "electrek-computer", "ingineerix", "weber"],
          },
        ],
      };
    default: {
      const neverMode: never = mode;
      return neverMode;
    }
  }
}
