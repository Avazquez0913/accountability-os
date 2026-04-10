//Responsibility: Track whether the user has earned an unlock today
//This is the core logic that everything else will connect to

//store the unlock state in memory for now
//We will move this to a database later
let unlockState = {
    isUnlocked: false,
    unlockedAt: null,
    reason: null,
    minutesEarned: 0
};

//Call this when a valid push is detected
const earnUnlock = (reason, minutes) => {
    unlockState.isUnlocked = true;
    unlockState.unlockedAt = new Date();
    unlockState.reason = reason;
    unlockState.minutesEarned = minutes;

    console.log(`Unlock earned! Reason: ${reason} | Minutes: ${minutes}`);
};

//Call this to check current unlock status
const getUnlockStatus = () => {
    return unlockState;
};

//Call this to reset at midnight 
const resetUnlock = () => {
    unlockState = {
        isUnlocked: false,
        unlockedAt: null,
        reason: null,
        minutesEarned: 0
    };
    console.log('Unlock state reset for the new day');
};

//Export the functions so other modules can use them
module.exports = {earnUnlock, getUnlockStatus, resetUnlock};