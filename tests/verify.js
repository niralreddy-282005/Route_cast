// Reproduces the two verification tests in the Prototype Readiness Report.
// Run: node tests/verify.js
const m = require('../src/model.js');

// Test 1: forecast vs simulated actual, weighted accuracy per stop (pass: >= 90% at every stop)
const acc = m.STOPS.map((s, i) => m.accuracy(i));
const min = Math.min(...acc), max = Math.max(...acc), mean = acc.reduce((a, b) => a + b) / acc.length;
console.log('Test 1  accuracy per stop: min %s%%  max %s%%  mean %s%%  ->  %s',
  (min * 100).toFixed(1), (max * 100).toFixed(1), (mean * 100).toFixed(1), min >= 0.9 ? 'PASS' : 'FAIL');

// Test 2: stop load over 715 stop-slots (11 stops x 65 slots), fixed fleet vs RouteCast plan (pass: 0 slots above 100%)
for (const mode of ['base', 'rc']) {
  let over = 0, total = 0, maxLoad = 0;
  for (let b = 0; b < m.NB; b++) {
    const t = m.T0 + b * m.STEP;
    for (let s = 0; s < m.STOPS.length; s++) {
      const load = m.FORECAST[s][b] / m.capStop(mode, s, t);
      total++; if (load >= 1) over++; maxLoad = Math.max(maxLoad, load);
    }
  }
  console.log('Test 2  %s: %d of %d slots over capacity, max load %s%%',
    mode === 'base' ? 'fixed fleet  ' : 'RouteCast plan', over, total, (maxLoad * 100).toFixed(0));
}

// Whole-day comparison shown on the dashboard
const a = m.dayStats('base'), b = m.dayStats('rc');
console.log('Peak-hour wait %s -> %s min; vehicle-hours %s -> %s',
  a.peakWait.toFixed(1), b.peakWait.toFixed(1), a.vehHours.toFixed(0), b.vehHours.toFixed(0));
