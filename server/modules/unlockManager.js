// unlockManager.js
// Responsibility: Track whether the user has earned an unlock today
// Now uses Redis for persistence so restarts don't wipe the state

const { redis } = require('./redisClient');
const { addMinutes } = require('./timerManager');

// The key we use to store unlock state in Redis
const UNLOCK_KEY = 'unlock:state';

// Call this when a valid push is detected
const earnUnlock = async (reason, minutes) => {

    // Build the unlock state object
    const unlockState = {
        isUnlocked: true,
        unlockedAt: new Date().toISOString(),
        reason: reason,
        minutesEarned: minutes
    };

    // Save to Redis so it survives restarts
    await redis.set(UNLOCK_KEY, JSON.stringify(unlockState));

    // Start the countdown timer with earned minutes
    addMinutes(minutes);

    console.log(`Unlock earned! Reason: ${reason} | Minutes: ${minutes}`);
};

// Call this to check current unlock status
const getUnlockState = async () => {

    // Get from Redis
    const data = await redis.get(UNLOCK_KEY);

    
    // If nothing stored return default locked state
    if (!data) {
        return {
            isUnlocked: false,
            unlockedAt: null,
            reason: null,
            minutesEarned: 0
        };
    }

    // Redis may return string or object depending on client
    return data;
};

// Call this to reset at midnight
const resetUnlock = async () => {

    // Delete the key from Redis
    await redis.del(UNLOCK_KEY);

    console.log('Unlock state reset for the new day');
};

module.exports = { earnUnlock, getUnlockState, resetUnlock };