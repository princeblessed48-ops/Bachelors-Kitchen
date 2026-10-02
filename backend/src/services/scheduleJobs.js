const cron = require('node-cron');
const { TIME_ZONE, runScheduleMaintenance } = require('./mealSchedulingService');

let maintenanceRunning = false;
let task;

const runWithLock = async () => {
  if (maintenanceRunning) return;
  maintenanceRunning = true;
  try {
    await runScheduleMaintenance();
    console.log('Meal schedule maintenance completed');
  } catch (error) {
    console.error('Meal schedule maintenance failed:', error.message);
  } finally {
    maintenanceRunning = false;
  }
};

const startScheduleJobs = () => {
  if (task) return task;
  task = cron.schedule('5 1 * * *', runWithLock, { timezone: TIME_ZONE });
  runWithLock();
  return task;
};

module.exports = { startScheduleJobs, runWithLock };