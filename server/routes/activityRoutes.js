const express = require('express');
const router = express.Router();

const {
    getActivities, getDailyScore, logActivity,
    setDailyLevel, getDailyLevel, getWeeklySummary, ACTIVITY_LEVELS
} = require('../modules/activityManager');

const { verifyEvidence } = require('../modules/nlpClient');
const { checkLeetCode } = require('../modules/leetcodePoller');

// Manual activity types (reading has its own NLP-verified endpoint)
const ALLOWED_MANUAL_TYPES = ['workout', 'leetcode', 'job_apply'];

// GET /api/level
router.get('/level', async (req, res) => {
    try {
        const level = await getDailyLevel();
        if (level === null) return res.status(200).json({ level: null, message: 'No level set for today' });
        res.status(200).json({ level, name: ACTIVITY_LEVELS[level].name, description: ACTIVITY_LEVELS[level].description });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/level
router.post('/level', async (req, res) => {
    try {
        const { level } = req.body;
        if (level === undefined || typeof level !== 'number') return res.status(400).json({ error: 'Missing or invalid level.' });
        const success = await setDailyLevel(level);
        if (!success) return res.status(400).json({ error: 'Invalid level. Must be 0-3.' });
        res.status(200).json({ message: `Level set to ${level}`, level });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/weekly-summary
router.get('/weekly-summary', async (req, res) => {
    try {
        const summary = await getWeeklySummary();
        res.status(200).json(summary);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/activities
router.get('/activities', async (req, res) => {
    try {
        res.status(200).json(await getActivities());
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/score
router.get('/score', async (req, res) => {
    try {
        res.status(200).json({ dailyScore: await getDailyScore() });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/activities/manual — workout, leetcode, job_apply
router.post('/activities/manual', async (req, res) => {
    try {
        const { type } = req.body;
        if (!ALLOWED_MANUAL_TYPES.includes(type)) return res.status(400).json({ error: 'Unsupported activity type.' });
        const record = await logActivity(type);
        res.status(201).json(record);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/check/leetcode — manually trigger a LeetCode poll
router.post('/check/leetcode', async (req, res) => {
    try {
        await checkLeetCode();
        res.status(200).json({ message: 'LeetCode check complete. See activity log for new solves.' });
    } catch (error) {
        res.status(500).json({ error: 'LeetCode check failed.' });
    }
});

// POST /api/activities/verify — dry-run NLP check, no points awarded
router.post('/activities/verify', async (req, res) => {
    try {
        const { claim, evidence } = req.body;
        if (!claim || !evidence) return res.status(400).json({ error: 'Both claim and evidence are required.' });
        const result = await verifyEvidence(claim, evidence);
        res.status(200).json(result);
    } catch (error) {
        res.status(502).json({ error: 'NLP verification service unavailable.' });
    }
});

// POST /api/activities/reading — verify evidence then award points
router.post('/activities/reading', async (req, res) => {
    try {
        const { claim, evidence } = req.body;
        if (!claim || !evidence) return res.status(400).json({ error: 'Both claim and evidence are required.' });

        const verification = await verifyEvidence(claim, evidence);
        if (!verification.verified) {
            return res.status(422).json({
                error: 'Evidence did not pass verification. Add more specific detail.',
                verification,
            });
        }

        const activity = await logActivity('reading');
        res.status(201).json({ activity, verification });
    } catch (error) {
        res.status(502).json({ error: 'NLP verification service unavailable.' });
    }
});

module.exports = router;
