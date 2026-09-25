export type Source = {
  id: string;
  short: string;
  title: string;
  url: string;
  supports: string;
};

export const sources = [
  {
    id: "motortrend",
    short: "MotorTrend / Munro",
    title: "Tesla Model 3 Teardown: The Nitty Gritty Details",
    url: "https://www.motortrend.com/features/tesla-model-3-teardown-details",
    supports:
      "Munro & Associates teardown: 4,416 Panasonic 2170 cells in four modules, 46-cell groups, ultrasonic wire bonds to aluminum collectors, potting to cooling passages.",
  },
  {
    id: "electrek-pack",
    short: "Electrek pack",
    title: "Tesla Model 3: Exclusive first look at Tesla's new battery pack architecture",
    url: "https://electrek.co/2017/08/24/tesla-model-3-exclusive-battery-pack-architecture/",
    supports:
      "Long-range pack: 4,416 cells, 46 per brick, four modules (two of 23 bricks and two of 25). Penthouse holds the charger, fast-charge contactors, and DC-DC. Pack is not externally connectorized except the charge port. No separate pack heater; powertrain heat is used instead.",
  },
  {
    id: "hughes",
    short: "Jason Hughes",
    title: "wk057 on Tesla Motors Club: Model 3 pack is 96S46P, 4,416 cells",
    url: "https://teslamotorsclub.com/tmc/threads/rumor-model-3-to-use-new-4416-battery-cell.94586/page-5",
    supports:
      "Primary count used here: long-range pack is 96 series groups by 46 parallel (4,416 cells of 2170). Four modules of 23, 25, 25, and 23 groups. The lower-range pack keeps that series layout and uses fewer cells per group.",
  },
  {
    id: "service-penthouse",
    short: "Service manual, penthouse",
    title: "Harness - Penthouse - HV Battery (Remove and Replace)",
    url: "https://www.tmodel3.com/harness_penthouse_hv_battery_remove_and_replace_-2196.html",
    supports:
      "Penthouse harness reaches module BMS connectors, the pyrotechnic battery disconnect, fast-charge contactor, positive DC link, and high-voltage interlock loops for the drive units.",
  },
  {
    id: "insideevs-cooling",
    short: "InsideEVs cooling",
    title: "How Tesla Reduced Costs & Assembly Time For Model 3 Cooling System",
    url: "https://insideevs.com/news/341977/how-tesla-reduced-costs-assembly-time-for-model-3-cooling-system/",
    supports:
      "Early Model 3: onboard charger and DC-DC combined, parts gathered in the penthouse, glycol superbottle with two pumps, a chiller, and a four-way valve that can separate or join the battery and powertrain loops.",
  },
  {
    id: "ingineerix",
    short: "Ingineerix",
    title: "Tesla Model 3 - Cooling System Overview",
    url: "https://www.youtube.com/watch?v=vgfXyLLaO7I",
    supports:
      "Early-car hose map: coolant splits to the firewall computers and to four module inlets, returns along a rocker, and can be put in series with the powertrain loop by the four-way valve.",
  },
  {
    id: "patent-octo",
    short: "US 11,932,078",
    title: "Electric vehicle heat pump using enhanced valve unit",
    url: "https://patents.google.com/patent/US11932078B2/en",
    supports:
      "Tesla octovalve: eight ports facing one way, in two rows of four, and a rotating stemshell. Connects battery, radiator, chiller, and powertrain / liquid-cooled condenser. A controller turns the stemshell to heat-pump modes. A charging mode can reverse flow and bypass the radiator and/or drive units.",
  },
  {
    id: "patent-valve",
    short: "US 10,344,877",
    title: "Multi-port valve with multiple operation modes",
    url: "https://patents.google.com/patent/US10344877B2/en",
    supports:
      "Earlier Tesla multi-port valve with one actuator and a stemshell, able to keep coolant loops separate or join them. Cited as prior art family, not as the heat-pump octovalve itself.",
  },
  {
    id: "service-octo",
    short: "Service manual, octovalve",
    title: "Octovalve (Remove and Replace)",
    url: "https://service.tesla.cn/docs/Model3/ServiceManual/2024/en-us/GUID-5EB54248-06DB-4155-8C8F-0670DBD75C83.html",
    supports:
      "On the heat-pump Model 3 the octovalve bolts to the supermanifold, under the front of the vehicle, with the coolant reservoir and radiator in that same front cooling section.",
  },
  {
    id: "munro-oil",
    short: "Munro, oil cooling",
    title: "Tearing Down Tesla Segment 8: motor cooling, Model 3 vs BMW i3",
    url: "https://munro.leandesign.com/wp/2020/03/10/tearing-down-tesla-segment-8-comparing-the-cooling-strategy-housings-of-motors-for-tesla-model-3-vs-bmw-i3/",
    supports:
      "Model 3 stator is oil-cooled through the laminations. A coolant-to-oil heat exchanger and an oil pump sit on the housing. Glycol does not run through the stator.",
  },
  {
    id: "weber",
    short: "Weber State",
    title: "Tesla Model 3 and Y Modular Motors (WeberAuto)",
    url: "https://www.youtube.com/watch?v=SRUrB7ruh-8",
    supports:
      "Rear rotor is an internal permanent-magnet machine; front dual-motor unit is induction. Stator is oil-cooled with an electric oil pump and a shared oil-to-coolant heat exchanger. Inverter bolts to the drive-unit housing.",
  },
  {
    id: "insideevs-motor",
    short: "InsideEVs drive units",
    title: "Check Out Tesla Model 3/Model Y's Modular Electric Drive Units",
    url: "https://insideevs.com/news/518692/tesla-model-3y-drive-units/",
    supports:
      "Rear motor is an IPM-SynRM; dual-motor front unit is induction. Reports the Weber State gear count: 81/31 × 83/24 ≈ 9.04:1 overall.",
  },
  {
    id: "marklines",
    short: "MarkLines / Munro",
    title: "Tesla Model 3 Teardown: Motor, Inverter, and Battery",
    url: "https://www.marklines.com/en/report/rep1830_201903",
    supports:
      "Munro-based summary: Model 3 drive unit moved to an interior permanent-magnet synchronous motor and oil cooling, with the inverter packaged as part of that smaller powertrain.",
  },
  {
    id: "vasa",
    short: "VASA / Munro",
    title: "Munro & Associates report details the ins and outs of EV inverters",
    url: "https://vasa.org.au/munro-associates-report-details-the-ins-and-outs-of-ev-inverters/",
    supports:
      "Munro's inverter benchmark describes the 2018 Model 3 rear inverter as a tightly packaged unit (reported mass 4.81 kg in that comparison).",
  },
  {
    id: "electrek-computer",
    short: "Electrek computer",
    title: "Tesla Model 3: first look at new dual computing platform",
    url: "https://electrek.co/2017/09/28/tesla-model-3-new-dual-computing-platform-autopilot-media/",
    supports:
      "Early Model 3 puts infotainment and Autopilot on two boards in one liquid-cooled module. That article's chips (Intel infotainment, Nvidia Autopilot) are the early car, not every later computer.",
  },
  {
    id: "service-computer",
    short: "Service manual, car computer",
    title: "Car Computer (Remove and Install)",
    url: "https://service.tesla.com/docs/Model3/ServiceManual/en-us/GUID-2AA012FD-0725-4F5A-998B-D46BCFDECDD3.html",
    supports:
      "The car computer is liquid-cooled, mounted at the passenger bulkhead, and reached with the glove box. It is a different service from the drive inverter.",
  },
  {
    id: "battery-day",
    short: "Battery Day",
    title: "Tesla 2020 Battery Day presentation deck",
    url: "https://digitalassets.tesla.com/tesla-contents/image/upload/IR/2020-battery-day-presentation-deck",
    supports:
      "Tesla's structural-battery proposal: cells as structure between face sheets, fewer parts, presented as a future pack — not the 2170 module pack already in Model 3.",
  },
  {
    id: "musk-battery-day",
    short: "Battery Day transcript",
    title: "2020 Annual Shareholder Meeting and Battery Day — battery pack remarks",
    url: "https://elonmuskinterviews.wordpress.com/2021/04/13/2020-annual-shareholder-meeting-and-battery-day-iii-battery-day-presentation-2-2/",
    supports:
      "Musk describes the structural pack as dual-use structure with no intermediate module supports, unlike the pack then in production.",
  },
  {
    id: "insideevs-4680",
    short: "InsideEVs 4680 pack",
    title: "Tesla's 4680 Structural Battery Pack Teardown",
    url: "https://insideevs.com/news/597786/tesla-structural-battery-pack-teardown-difficult/",
    supports:
      "The structural pack that reached production (Austin Model Y in this report) uses glued 4680 cells and no modules. That is a different object from the Model 3 2170 pack drawn here.",
  },
  {
    id: "dimensions",
    short: "Model 3 dimensions",
    title: "Tesla Model 3 — published overall dimensions",
    url: "https://en.wikipedia.org/wiki/Tesla_Model_3",
    supports:
      "Overall envelope used for the schematic body: wheelbase 2,875 mm, length about 4,694 mm, width about 1,849 mm, height about 1,443 mm. The surface drawn here is original. It is not factory CAD.",
  },
] as const satisfies readonly Source[];

export type SourceId = (typeof sources)[number]["id"];

const byId = new Map<SourceId, Source>(sources.map((source) => [source.id, source]));

export function sourceById(id: SourceId): Source {
  const found = byId.get(id);
  if (!found) {
    throw new Error(`Missing source ${id}`);
  }
  return found;
}
