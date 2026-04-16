// activityManager.js
// Responsibility: Track all activities and calculate daily score
// Each activity type has a point value and screen time reward

const { redis } = require('./redisClient');

const ACTIVITIES_KEY = 'activities:today';
const SCORE_KEY = 'score:today';
const LEVEL_KEY = 'level:today';
const LEVELS_HISTORY_KEY = 'levels:history';

const ACTIVITY_LEVELS = {
    0: { name: 'Off Day',    description: 'Rest day' },
    1: { name: 'Survival',   description: '1 commit, light movement, 1 small career action' },
    2: { name: 'Standard',   description: '1 push, workout, 1 career action' },
    3: { name: 'Relentless', description: '2+ sessions, full workout, 2 career actions' }
};

const ACTIVITY_TYPES = {
    github_push: { points: 40, minutes: 45, label: 'GitHub Push' },
    workout:     { points: 30, minutes: 30, label: 'Workout' },
    reading:     { points: 20, minutes: 20, label: 'Reading' },
    job_apply:   { points: 25, minutes: 25, label: 'Job Application' },
    leetcode:    { points: 30, minutes: 30, label: 'LeetCode' }
};

const logActivity = async (type) => {
    if (!ACTIVITY_TYPES[type]) {
        console.log(`Unknown activity type: ${type}`);
        return null;
    }

    const activity = ACTIVITY_TYPES[type];
    const record = {
        type,
        label: activity.label,
        points: activity.points,
        minutes: activity.minutes,
        timestamp: new Date().toISOString()
    };

    const existing = await redis.get(ACTIVITIES_KEY);
    const activities = existing ? (typeof existing === 'string' ? JSON.parse(existing) : existing) : [];
    activities.push(record);

    await redis.set(ACTIVITIES_KEY, JSON.stringify(activities));

    const totalScore = activities.reduce((sum, a) => sum + a.points, 0);
    await redis.set(SCORE_KEY, totalScore);

    console.log(`Activity logged: ${activity.label} | Points: ${activity.points} | Daily score: ${totalScore}`);
    return record;
};

const getActivities = async () => {
    const data = await redis.get(ACTIVITIES_KEY);
    return data ? (typeof data === 'string' ? JSON.parse(data) : data) : [];
};

const getDailyScore = async () => {
    const score = await redis.get(SCORE_KEY);
    return score ? Number(score) : 0;
};

const setDailyLevel = async (level) => {
    if (!Number.isInteger(level) || level < 0 || level > 3) return false;

    await redis.set(LEVEL_KEY, level);

    const today = new Date().toISOString().split('T')[0];
    const existing = await redis.get(LEVELS_HISTORY_KEY);
    const history = existing ? JSON.parse(existing) : [];
    const filtered = history.filter(e => e.date !== today);
    filtered.push({ date: today, level });
    await redis.set(LEVELS_HISTORY_KEY, JSON.stringify(filtered.slice(-30)));

    console.log(`Daily level set to ${level}: ${ACTIVITY_LEVELS[level].name}`);
    return true;
};

const getDailyLevel = async () => {
    const level = await redis.get(LEVEL_KEY);
    return level !== null ? Number(level) : null;
};

const getWeeklySummary = async () => {
    const history = await redis.get(LEVELS_HISTORY_KEY);
    const levels = history ? JSON.parse(history) : [];

    const now = new Date();
    const weekLevels = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(now.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const entry = levels.find(l => l.date === dateStr);
        weekLevels.push({ date: dateStr, level: entry ? entry.level : null });
    }

    const distribution = { 0: 0, 1: 0, 2: 0, 3: 0 };
    weekLevels.forEach(day => { if (day.level !== null) distribution[day.level]++; });

    let streak = 0;
    for (let i = weekLevels.length - 1; i >= 0; i--) {
        if (weekLevels[i].level && weekLevels[i].level > 0) streak++;
        else break;
    }

    return { weekLevels, distribution, streak };
};

const resetActivities = async () => {
    await redis.del(ACTIVITIES_KEY);
    await redis.del(SCORE_KEY);
    await redis.del(LEVEL_KEY);
    console.log('Activities, score, and level reset for new day');
};

module.exports = {
    logActivity, getActivities, getDailyScore, resetActivities,
    setDailyLevel, getDailyLevel, getWeeklySummary,
    ACTIVITY_TYPES, ACTIVITY_LEVELS
};
