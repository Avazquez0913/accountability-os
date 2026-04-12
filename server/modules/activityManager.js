// activityManager.js
// Responsibility: Track all activities and calculate daily score
// Each activity type has a point value and screen time reward
// This is the core of the scoring system

const { redis } = require('./redisClient');

// Key for storing activities in Redis
const ACTIVITIES_KEY = 'activities:today';
const SCORE_KEY = 'score:today';

// Define all activity types with their point values and screen time rewards
// To add a new activity type just add it here
const ACTIVITY_TYPES = {
    github_push: { points: 40, minutes: 45, label: 'GitHub Push' },
    workout:     { points: 30, minutes: 30, label: 'Workout' },
    reading:     { points: 20, minutes: 20, label: 'Reading' },
    job_apply:   { points: 25, minutes: 25, label: 'Job Application' },
    leetcode:    { points: 30, minutes: 30, label: 'LeetCode' }
};

// Log a new activity and update the daily score
const logActivity = async (type) => {

    // Make sure the activity type is valid
    if (!ACTIVITY_TYPES[type]) {
        console.log(`Unknown activity type: ${type}`);
        return null;
    }

    const activity = ACTIVITY_TYPES[type];

    // Build the activity record
    const record = {
        type: type,
        label: activity.label,
        points: activity.points,
        minutes: activity.minutes,
        timestamp: new Date().toISOString()
    };

    // Get existing activities from Redis
    const existing = await redis.get(ACTIVITIES_KEY);
    const activities = existing ? (typeof existing === 'string' ? JSON.parse(existing) : existing) : [];

    // Add new activity
    activities.push(record);

    // Save updated activities to Redis
    await redis.set(ACTIVITIES_KEY, JSON.stringify(activities));

    // Recalculate daily score
    const totalScore = activities.reduce((sum, a) => sum + a.points, 0);
    await redis.set(SCORE_KEY, totalScore);

    console.log(`Activity logged: ${activity.label} | Points: ${activity.points} | Daily score: ${totalScore}`);

    return record;
};

// Get all activities for today
const getActivities = async () => {
    const data = await redis.get(ACTIVITIES_KEY);
    return data ? (typeof data === 'string' ? JSON.parse(data) : data) : [];
};

// Get today's total score
const getDailyScore = async () => {
    const score = await redis.get(SCORE_KEY);
    return score ? Number(score) : 0;
};

// Reset activities at midnight
const resetActivities = async () => {
    await redis.del(ACTIVITIES_KEY);
    await redis.del(SCORE_KEY);
    console.log('Activities and score reset for new day');
};

// Export activity types so other modules can reference them
module.exports = { logActivity, getActivities, getDailyScore, resetActivities, ACTIVITY_TYPES };