// Responsibility: Handle all scheduled tasks

const cron = require('node-cron');
const { resetUnlock } = require('./unlockManager');
const { resetActivities } = require('./activityManager');
const { checkLeetCode } = require('./leetcodePoller');

const startScheduler = () => {

    // Midnight reset — clear activities, score, level, and unlock state
    cron.schedule('0 0 * * *', () => {
        console.log('Midnight reset triggered');
        resetUnlock();
        resetActivities();
    });

    // LeetCode poll — check for new accepted submissions every hour
    cron.schedule('0 * * * *', () => {
        checkLeetCode();
    });

    // Run once on startup to catch any solves since last deploy
    checkLeetCode();

    console.log('Scheduler started — midnight reset + LeetCode polling active');
};

module.exports = { startScheduler };
