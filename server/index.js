// Entry point of the server
// Responsibility: Start the server and register middleware and routes

const express = require('express');
const cors = require('cors');

const { handleGithubPush } = require('./webhook');
const { getUnlockState } = require('./modules/unlockManager');
const { startScheduler } = require('./modules/scheduler');
const { getTimerState, loadTimerState } = require('./modules/timerManager');
const activitiesRouter = require('./routes/activityRoutes');

const app = express();

app.use(express.json());
app.use(cors());

// Health check
app.get('/', (req, res) => {
    res.send('AccountabilityOS Server is running!');
});

app.post('/webhook/github', handleGithubPush);

// Unlock status for the mobile app
app.get('/status', async (req, res) => {
    const status = await getUnlockState();
    res.status(200).json(status);
});

// Timer state for the mobile app
app.get('/timer', (req, res) => {
    res.status(200).json(getTimerState());
});

// All activity, score, level, and NLP routes
app.use('/api', activitiesRouter);

// Use Railway's PORT env var — critical for deployment
const PORT = process.env.PORT || 3000;

loadTimerState();
startScheduler();

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
