//Entry point of the server
//Responsibility: Start the server and register middleware and routes

const express = require('express');

//Import the webhook handler function
const {handleGithubPush} = require('./webhook');

const {getUnlockState} = require('./modules/unlockManager');

//import the scheduler to start the scheduled tasks
const {startScheduler} = require('./modules/scheduler');

//Import loadtTimerState to restore timer state on startup
const {getTimerState, loadTimerState} = require('./modules/timerManager');

//Import activity manager for score and activity routes
const {getActivities, getDailyScore} = require('./modules/activityManager');

//Import cors to allow mobile app to connect
const cors = require('cors');

//Create the express application
const app = express();

//Middleware: Parse incoming JSON requests
//This allows us to read req.body when Github sends us data
app.use(express.json());

//Enable CORS so the mobile app can connect to this server from a different domain
app.use(cors());

//Health check route
//Lets us verify the server is running
app.get('/', (req, res) => {
    res.send('AccountabilityOS Server is running!');
});

app.post('/webhook/github', handleGithubPush);

//Status route
//Returns current unlock state as JSON
//This is what the mobile app will call
app.get('/status', async (req, res) => {
    const status = await getUnlockState();
    res.status(200).json(status);
});

//Responsibility: Return how many minures of screen time are remaining
app.get('/timer', (req, res) => {

    //Get the current timer state from time manager
    const timer = getTimerState();
    
    //Send it back as JSON
    res.status(200).json(timer);
});

//Start the server port on 3000
//We will move this to an environment variable later
const PORT = 3000;

//Restore timer state from Redis on server startup
loadTimerState();
//Start the scheduler to activate scheduled tasks
startScheduler();
//Enable CORS so the mobile app can connect to this server

//Activities route 
//Returns all activities logged today
app.get('/activities', async (req, res) => {
    const activities = await getActivities();
    res.status(200).json(activities);
});

//Score route
//Returns the total score for today
app.get('/score', async (req, res) => {
    const score = await getDailyScore();
    res.status(200).json({ dailyScore : score });
});
//Start the server
app.listen(PORT,() => {
    console.log(`Server running on port ${PORT}`);
});
