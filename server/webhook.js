//Responsibility: Handle incoming webhook events from Github
//When you push code, Github sends a POST request here

//Import unlock manager
const {earnUnlock} = require('./modules/unlockManager');

//Import activity manager to log activities
const {logActivity} = require('./modules/activityManager');

//This function processes the push event
const handleGithubPush = async (req, res) => {

    //Github sends the event type in the headers
    const githubEvent = req.headers['x-github-event'];

    //We only care about push events, ignore everything else
    if (githubEvent !== 'push') {
        return res.status(200).send('Event ignored');
    }

    //Extract useful info from the push payload
    const { repository, pusher,  commits}   = req.body;

    //Log the push details so we can see it working
    console.log('Push detected!');
    console.log(`Repo: ${repository.name}`);
    console.log(`Pushed by: ${pusher.name}`);
    console.log(`Commits: ${commits.length}`);

    //Log the github push as an activity
    const activity = await logActivity('github_push');
    //Reward the push with 45 minutes of screen time
    await earnUnlock('Github Push', activity.minutes);
    //Send sucess response back to Github
    res.status(200).send('Push received');

};

//Export so index.js can see this
module.exports = {handleGithubPush};