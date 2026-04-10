//Responsibilty: Track and count down earned screen time
//When minutes hit zero the phone should lock
//This module manages the timer state

let timerState = {
    //Total minutes earned from completed tasks
    minutesRemaining: 0,
    //Whether the timer is actively counting down
    isRunning: false,
    //Reference to the interval os we can stop it
    intervalId: null
};

//Add minutes to the timer when a task is conpleted
const addMinutes = (minutes) => {
    timerState.minutesRemaining += minutes;
    console.log(`Added ${minutes} minutes | Total remaining: ${timerState.minutesRemaining}`);

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
    timerState.intervalId = setInterval(() => {
        timerState.minutesRemaining -= 1;
        console.log(`Minutes remaining: ${timerState.minutesRemaining}`);

        //If time runs out, stop the timer and lock
        if (timerState.minutesRemaining <= 0) {
            stopTimer();
            console.log('Time is up! Phone should lock now.');
            //Here we would trigger the phone lock mechanism
        }
    }, 60000);
};

//Stop the timer
const stopTimer = () => {
    clearInterval(timerState.intervalId);
    timerState.isRunning = false;
    timerState.minutesRemaining = 0;
    console.log('Timer stopped');
};

//Get current timer state
const getTimerState = () => {
    return{
        minutesRemaining: timerState.minutesRemaining,
        isRunning: timerState.isRunning
    };
};

module.exports = {addMinutes, stopTimer, getTimerState };