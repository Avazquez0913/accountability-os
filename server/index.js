//Entry point of the server
//Responsibility: Start the server and register middleware and routes

const express = require('express');

//Import the webhook handler function
const {handleGithubPush} = require('./webhook');

const {getUnlockState} = require('./modules/unlockManager');

//Create the express application
const app = express();

//Middleware: Parse incoming JSON requests
//This allows us to read req.body when Github sends us data
app.use(express.json());

//Health check route
//Lets us verify the server is running
app.get('/', (req, res) => {
    res.send('AccountabilityOS Server is running!');
});

app.post('/webhook/github', handleGithubPush);

//Status route
//Returns current unlock state as JSON
//This is what the mobile app will call
app.get('/status', (req, res) => {
    const status = getUnlockState();
    res.status(200).json(status);
});
//Start the server port on 3000
//We will move this to an environment variable later
const PORT = 3000;
app.listen(PORT,() => {
    console.log(`Server running on port ${PORT}`);
});
