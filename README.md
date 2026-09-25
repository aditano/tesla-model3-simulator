# Model 3 systems

An unofficial, high-school classroom schematic of a **heat-pump Tesla Model 3**: the rear motor, the long-range 2170 pack, the penthouse electronics, the octovalve, and the car computer.

The body is an original silhouette so you can tell front from back. The parts inside are simplified on purpose. If a shape is not in a teardown, a Tesla patent, or a service procedure, the page says **schematic, not to scale**.

Not affiliated with Tesla, Inc.

## Run it

```bash
npm install
npm run dev
```

Open [http://localhost:5173/tesla-model3-simulator/](http://localhost:5173/tesla-model3-simulator/). The dev server uses the same base path as GitHub Pages.

```bash
npm run build
npm run preview
```

Preview is at [http://localhost:4173/tesla-model3-simulator/](http://localhost:4173/tesla-model3-simulator/).

## GitHub Pages

After this lands on `main`, the workflow [`.github/workflows/pages.yml`](.github/workflows/pages.yml) builds the site and deploys it.

Expected URL: [https://aditano.github.io/tesla-model3-simulator/](https://aditano.github.io/tesla-model3-simulator/)

In the repository settings, set **Pages → Build and deployment → Source** to **GitHub Actions** once. The workflow requests the `pages` environment itself.

## How to use it

Drag to orbit, pinch or scroll to zoom, right-drag to pan. On a phone, one finger orbits and two fingers zoom.

| Key | Action |
| --- | --- |
| `B` | Make the body transparent |
| `1`–`5` | Motor, pack, penthouse, octovalve, computers |
| `0` | Close the body |
| `[` `]` | Nudge the active control |
| `R` | Reset the camera |
| `/` | Hide the interface |
| `Esc` | Step back out |

You can also click a label on the car. Each system has one control:

- **Motor** — rotor speed. The magnetic ribbons stay locked to the rotor, the windings warm, and the rear wheel turns much more slowly.
- **Pack** — charge rate. Pulses run along the collectors into a cutaway of 2170 cells.
- **Penthouse** — state of charge. AC at the charge port becomes DC in the onboard charger, and the flow eases as the pack fills.
- **Octovalve** — four positions. Blue glycol changes which parts it visits. Amber is oil inside the motor.
- **Computers** — driver-assistance load. Cameras, the module, and its coolant branch brighten together.

The main screen stays on cause and effect. Counts, patents, and the limits of the drawing are behind **Why it’s drawn this way**, and the full list is in [SOURCES.md](SOURCES.md).

## Reference car

One generation, so the systems actually coexist:

- Heat-pump Model 3 (octovalve bolted to the front supermanifold)
- Long-range pack: 4,416 cylindrical 2170 cells, 96 series groups × 46 parallel, in four modules (23, 25, 25, 23)
- Rear drive unit: interior permanent-magnet synchronous reluctance motor, oil-cooled stator, inverter on the housing
- Dual-motor front unit: induction motor, shown only as context
- Car computer: liquid-cooled module on the passenger bulkhead

Early Model 3 cars used a superbottle and a four-way valve, plus a resistive cabin heater, instead of the octovalve. Those hoses are not drawn. Later cars changed the computer chips; this view does not label a processor.

## What “structural pack” means here

The 2170 case is a bolted part of the floor. Tesla’s **structural battery** from Battery Day is a different design: 4680 cells bonded as the structure, with no modules. That pack reached production on vehicles such as the Austin Model Y. It is explained in the pack notes and is not modeled, because drawing it inside this car would be an invention.

## Methodology

1. Prefer Munro & Associates teardowns, Tesla patents, Tesla service procedures, and primary reverse-engineering (Jason Hughes on the cell count, Weber State on the drive unit).
2. Where a secondary write-up conflicts with a more direct count, follow the direct count and say so. The 96S46P figure is Hughes; a MotorTrend sentence swaps “series” and “parallel.”
3. Draw the pattern, not a fake part. The cutaway does not contain 4,416 cells. Cooling gaps are wide so they can be seen. Field lines are not a simulation. Valve hoses are not the patent’s port map.
4. No equations on the main controls. The gear reduction (about nine rotor turns per wheel turn on one teardown unit) is used in the animation and cited in the notes.

## Stack

[Vite](https://vitejs.dev/), React, and [React Three Fiber](https://r3f.docs.pmnd.rs/). All geometry is procedural. There is no vehicle CAD in the repo.

Works in current Chrome and Safari on desktop and phones. `prefers-reduced-motion` stops continuous spinning and keeps the controls as poses.
