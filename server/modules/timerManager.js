//Responsibilty: Track and count down earned screen time
//When minutes hit zero the phone should lock
//This module manages the timer state

//Import Redis client to persist timer state
const { redis } = require('./redisClient');

//Key for storing timer state in Redis
const TIMER_KEY = 'timer:state';

let timerState = {
    //Total minutes earned from completed tasks
    minutesRemaining: 0,
    //Whether the timer is actively counting down
    isRunning: false,
    //Reference to the interval os we can stop it
    intervalId: null
};

//Load timer state from Redis on server startup
//This restores minutes remamining after a restart
const loadTimerState = async () => {
    const data = await redis.get(TIMER_KEY);
    if (data) {
        const saved = typeof data === 'string' ? JSON.parse(data) : data;
        timerState.minutesRemaining = saved.minutesRemaining || 0;
        console.log(`Timer restored froom Redis: ${timerState.minutesRemaining} minutes`);

        //Resume countdown if there are minutes remaining
        if (timerState.minutesRemaining > 0) {
            startTimer();
        }
    }else {
        console.log('No saved timer state found in Redis');
    }
};

//Add minutes to the timer when a task is conpleted
const addMinutes = async (minutes) => {
    timerState.minutesRemaining += minutes;
    console.log(`Added ${minutes} minutes | Total remaining: ${timerState.minutesRemaining}`);

    //Save to Redis so it survives restarts
    await redis.set(TIMER_KEY, JSON.stringify({
        minutesRemaining: timerState.minutesRemaining
    }));

    //If timer is not running, start it
    if (!timerState.isRunning) {
        startTimer();
    }
};

//Start counting down every minute
const startTimer = () => {
    timerState.isRunning = true;
    console.log('Timer started - counting down');

    //Run every 60 seconds (60000 ms)
    timerState.intervalId = setInterval(async () => {
        timerState.minutesRemaining -= 1;
        console.log(`Minutes remaining: ${timerState.minutesRemaining}`);

          //Save updated minutes to Redis every tick
        await redis.set(TIMER_KEY, JSON.stringify({
        minutesRemaining: timerState.minutesRemaining
        }));

        //If time runs out, stop the timer and lock
        if (timerState.minutesRemaining <= 0) {
            stopTimer();
            console.log('Time is up! Phone should lock now.');
            //Here we would trigger the phone lock mechanism
        }
    }, 60000);
};

//Stop the timer
const stopTimer = async () => {
    clearInterval(timerState.intervalId);
    timerState.isRunning = false;
    timerState.minutesRemaining = 0;
    console.log('Timer stopped');
    await redis.del(TIMER_KEY);
};

//Get current timer state
const getTimerState = () => {
    return{
        minutesRemaining: timerState.minutesRemaining,
        isRunning: timerState.isRunning
    };
};

module.exports = {addMinutes, stopTimer, getTimerState, loadTimerState};