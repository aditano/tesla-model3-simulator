# Sources

This simulator draws a **heat-pump Tesla Model 3 with the long-range 2170 pack**. It does not mix that car with the earlier superbottle thermal system or with the later 4680 structural pack.

Geometry is original and procedural. Anything that is not established below is labeled **schematic, not to scale** in the interface.

## Pack and penthouse

- [MotorTrend, “Tesla Model 3 Teardown: The Nitty Gritty Details”](https://www.motortrend.com/features/tesla-model-3-teardown-details) — Munro & Associates: 4,416 Panasonic 2170 cells in four modules; groups of 46 cells; ultrasonic wire bonds to stamped aluminum collectors; potting compound bonding cells to cooling passages.
- [Jason Hughes (wk057), Tesla Motors Club](https://teslamotorsclub.com/tmc/threads/rumor-model-3-to-use-new-4416-battery-cell.94586/page-5) — Long-range pack is 96S46P (4,416 cells). Four modules of 23, 25, 25, and 23 groups. The shorter-range pack keeps that series layout and uses fewer cells in parallel. This is the series-parallel count the simulator follows. A MotorTrend sentence describes the 46-cell groups as connected “in series”; that wording conflicts with the 96S46P count and is not used here.
- [Electrek, “Exclusive first look at Tesla’s new battery pack architecture”](https://electrek.co/2017/08/24/tesla-model-3-exclusive-battery-pack-architecture/) — Same 4,416 / 46-per-brick / 23-and-25 module split. Charger, fast-charge contactors, and DC-DC live in the pack. No external HV connector except the charge port. No separate pack heater; the powertrain can be used to warm the pack, including while parked.
- [Penthouse harness procedure](https://www.tmodel3.com/harness_penthouse_hv_battery_remove_and_replace_-2196.html) — Pyrotechnic battery disconnect, fast-charge contactor, positive DC link, module BMS connectors, and drive-unit interlock loops.
- [InsideEVs, Model 3 cooling consolidation](https://insideevs.com/news/341977/how-tesla-reduced-costs-assembly-time-for-model-3-cooling-system/) — Onboard charger and DC-DC combined into the penthouse PCS. Early thermal hardware is a superbottle: two pumps, a chiller, and a four-way valve that can separate or join the battery and powertrain glycol loops.

The AC-charging control follows that PCS path: wall AC into the onboard charger, DC into the pack. DC fast charge uses the fast-charge contactor and skips the onboard charger, so it is not the path the meter drives.

## What “structural” does and does not mean

- The 2170 pack is a bolted part of the floor. Electrek notes the retaining bolts are reached from inside the cabin.
- [Tesla Battery Day deck, 2020](https://digitalassets.tesla.com/tesla-contents/image/upload/IR/2020-battery-day-presentation-deck) and [the Battery Day pack remarks](https://elonmuskinterviews.wordpress.com/2021/04/13/2020-annual-shareholder-meeting-and-battery-day-iii-battery-day-presentation-2-2/) describe a later structural pack: cells as the structure, intermediate module supports removed.
- [InsideEVs, 4680 structural pack teardown](https://insideevs.com/news/597786/tesla-structural-battery-pack-teardown-difficult/) — The production structural pack Munro opened (Austin Model Y) is glued 4680 cells and has no modules.

This view does not draw that 4680 pack.

## Octovalve and cooling

- [US 11,932,078 B2, “Electric vehicle heat pump using enhanced valve unit”](https://patents.google.com/patent/US11932078B2/en) — Tesla names an eight-port octovalve. Ports face one direction, in two rows of four. A stemshell rotates under a controller. The valve connects the battery, radiator, chiller, and powertrain / liquid-cooled condenser. A charging mode can reverse coolant flow and bypass the radiator and/or drive units.
- [US 10,344,877 B2, “Multi-port valve with multiple operation modes”](https://patents.google.com/patent/US10344877B2/en) — Earlier single-actuator stemshell valve that can keep loops separate or join them. Prior art, not the heat-pump octovalve itself.
- [Model 3 service procedure, “Octovalve (Remove and Replace)”](https://service.tesla.cn/docs/Model3/ServiceManual/2024/en-us/GUID-5EB54248-06DB-4155-8C8F-0670DBD75C83.html) — The octovalve bolts to the supermanifold under the front of the car, with the coolant reservoir and radiator in that front section.
- [Ingineerix, “Tesla Model 3 - Cooling System Overview”](https://www.youtube.com/watch?v=vgfXyLLaO7I) — Early-car hoses: a split to the firewall computers, four module inlets, a rocker return, and the four-way valve that can put the pack in series with the powertrain.
- [Munro, motor cooling versus the BMW i3](https://munro.leandesign.com/wp/2020/03/10/tearing-down-tesla-segment-8-comparing-the-cooling-strategy-housings-of-motors-for-tesla-model-3-vs-bmw-i3/) — The Model 3 stator is cooled by oil in the laminations. A coolant-to-oil exchanger and an oil pump sit on the housing. Glycol does not run through the windings.

The four valve positions are classroom stand-ins for those documented jobs (shed heat at the radiator, scavenge powertrain heat into the pack, feed the cabin, and the patent’s charging bypass). They are not a tracing of the patent figures.

## Motor

- [Weber State University, “Tesla Model 3 and Y Modular Motors”](https://www.youtube.com/watch?v=SRUrB7ruh-8) — Rear rotor is an internal permanent-magnet machine. The front dual-motor unit is induction. The stator is oil-cooled (ATF) by an electric pump, with an oil-to-coolant exchanger. The inverter bolts to the drive-unit housing.
- [InsideEVs, modular drive units](https://insideevs.com/news/518692/tesla-model-3y-drive-units/) — Rear motor described as an IPM-SynRM; front motor as induction. Reports the Weber gear count: (81/31) × (83/24) ≈ 9.04:1 on that unit. The simulator uses that ratio so the rear wheel turns much more slowly than the rotor. Later drive units can differ.
- [MarkLines / Munro summary](https://www.marklines.com/en/report/rep1830_201903) — Interior permanent-magnet synchronous motor, oil cooling, inverter packaged with the powertrain.
- [VASA, Munro inverter benchmark](https://vasa.org.au/munro-associates-report-details-the-ins-and-outs-of-ev-inverters/) — 2018 Model 3 rear inverter described as a compact integrated unit.

Field ribbons, slot marks, and the six magnet bars are schematic. They are not a pole count or a finite-element solution. The ribbons are locked to the rotor because this rear machine is synchronous.

## Computers

- [Tesla service manual, “Car Computer (Remove and Install)”](https://service.tesla.com/docs/Model3/ServiceManual/en-us/GUID-2AA012FD-0725-4F5A-998B-D46BCFDECDD3.html) — Liquid-cooled car computer on the passenger bulkhead, serviced with the glove box, and not serviced as the same part as the drive inverter.
- [Electrek, dual computing platform](https://electrek.co/2017/09/28/tesla-model-3-new-dual-computing-platform-autopilot-media/) — Early Model 3: infotainment and Autopilot are two boards in one liquid-cooled module. The chips named there (Intel infotainment, Nvidia Autopilot) are that early car. Later Hardware 3 and later infotainment boards are not drawn as a specific processor.
- Ingineerix cooling video, above — A glycol branch serves the car computer.

Camera positions (windshield trio, fender repeaters, rear camera) are the familiar Model 3 set, drawn schematically. Harness routing is a single-line diagram, not the production loom.

## Deliberately not drawn

- 4680 cell-to-pack internals
- Exact hose port map from the octovalve figures
- Production winding, slot, and magnet counts
- A specific infotainment or Autopilot chip
- Usable kilowatt-hours (nameplate and usable energy are easy to mix, and the lesson does not need them)
