# RouteCast AI

AI + GPS demand prediction for transport fleets. Web prototype built for the *Ideation and Business Model Design* PBA Prototype Assessment (Woxsen University, Entrepreneurship Track).

**Idea:** fleets run fixed timetables, so commuters wait at busy stops while other trips run nearly empty. RouteCast forecasts passengers per stop 30 minutes ahead and tells the dispatcher how many vehicles each route needs.

## Implemented features

1. **Demand forecast map.** Forecast passengers per 15 minutes at 11 stops on three proposed Hyderabad IT-corridor routes, colour-coded by load.
2. **Fleet dispatch advice.** Recommended vehicles per route 30 minutes ahead, compared against a fixed fleet.
3. *(Stretch)* **Commuter view.** Next-shuttle ETA and expected crowd level for a chosen stop.

## Run it

Open `index.html` in a browser. No install, no build step, no network access needed except an optional web font.

Use the time slider or **Play**, switch **Fixed timetable / With RouteCast**, click stops, and drag or scroll the map.

## Verify it

```
node tests/verify.js
```

Reproduces the two tests in the readiness report: forecast accuracy per stop, and stop-slots over capacity under a fixed fleet versus the RouteCast plan.

## What is real and what is simulated

- Passenger demand, vehicle positions and the "actual" values are **simulated** from a fixed random seed (`src/model.js`).
- The forecast is a simulated model with injected error. It is **not** a trained machine-learning model yet.
- The basemap is schematic. Stop positions are approximate and the routes are proposals, not operating services.
- Readiness: **TRL 3** (critical function demonstrated on simulated data).

## Next steps

Log real GPS and boarding counts from one shuttle route, train a simple ML baseline and compare it with the historical average, then run interviews and a pilot.

## Tools and disclosure

Plain HTML, CSS, JavaScript and SVG. No frameworks or map APIs. Code was written with an AI assistant (Claude).

## Market sizing (bottom-up, assumptions marked *)

TAM about 65,000 organised urban buses in India (CSE-CITIES Forum, 2026) at an assumed Rs 2,000 per vehicle per month*. SAM Hyderabad IT-corridor employee shuttles, about 3,400 vehicles*. SOM about 100 vehicles in the first 12 to 18 months*.
