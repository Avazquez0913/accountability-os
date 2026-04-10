//Responsibility: Handle all scheduled tasks
//Currently handles the midnight reset of unlock state
//New scheduled tasks get added here in the future

const cron = require('node-cron');
const {resetUnlock} = require('./unlockManager');

//Schedule a task to run at midnight every day
//Cron syntax: second minute hour day month weekday
//'0 0 * * *' means "At 00:00 (midnight) every day"
const startScheduler = () => {

    cron.schedule('0 0 * * *', () => {
        console.log('Midnight reset triggered - new day started');
        resetUnlock();
    });

    console.log('Scheduler started - midnight reset active');
};

//Export the start function so index.js can call it
module.exports = {startScheduler};