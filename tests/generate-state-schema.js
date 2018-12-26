const visualize = require('javascript-state-machine/lib/visualize');
const StateMachine = require('javascript-state-machine');

(async () => {
  const machine = new StateMachine((await import('../models/status.mjs')).default);
  process.stdout.write(visualize(machine));
})();
