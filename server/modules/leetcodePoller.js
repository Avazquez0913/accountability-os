// leetcodePoller.js
// Responsibility: Poll LeetCode's GraphQL API for new accepted submissions
// When a new solve is found that hasn't been logged yet, award points automatically

const { redis } = require('./redisClient');
const { logActivity } = require('./activityManager');
const { earnUnlock } = require('./unlockManager');

const LEETCODE_USERNAME = process.env.LEETCODE_USERNAME || 'Avazquez0913';
const LAST_SEEN_KEY = 'leetcode:last_seen_id';
const LEETCODE_API = 'https://leetcode.com/graphql';

const QUERY = `
  query recentAcSubmissions($username: String!, $limit: Int!) {
    recentAcSubmissionList(username: $username, limit: $limit) {
      id
      title
      timestamp
    }
  }
`;

// Fetch recent accepted submissions from LeetCode
const fetchRecentSolves = async () => {
    const res = await fetch(LEETCODE_API, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Referer': 'https://leetcode.com',
        },
        body: JSON.stringify({
            query: QUERY,
            variables: { username: LEETCODE_USERNAME, limit: 5 },
        }),
    });

    if (!res.ok) throw new Error(`LeetCode API responded with ${res.status}`);

    const json = await res.json();
    return json?.data?.recentAcSubmissionList ?? [];
};

// Check for new solves and award points for each new one
const checkLeetCode = async () => {
    try {
        console.log(`Polling LeetCode for ${LEETCODE_USERNAME}...`);

        const submissions = await fetchRecentSolves();
        if (!submissions.length) return;

        const lastSeenId = await redis.get(LAST_SEEN_KEY);
        const latestId = submissions[0].id;

        // Nothing new since last check
        if (lastSeenId === latestId) {
            console.log('LeetCode: no new solves');
            return;
        }

        // Find all submissions newer than the last seen one
        const newSolves = lastSeenId
            ? submissions.filter(s => s.id > lastSeenId)
            : [submissions[0]]; // first run — only award for the most recent

        for (const solve of newSolves) {
            console.log(`LeetCode solve detected: ${solve.title}`);
            const activity = await logActivity('leetcode');
            await earnUnlock(`LeetCode: ${solve.title}`, activity.minutes);
        }

        // Update the last seen ID
        await redis.set(LAST_SEEN_KEY, latestId);
        console.log(`LeetCode: logged ${newSolves.length} new solve(s)`);

    } catch (error) {
        console.error('LeetCode poll error:', error.message);
    }
};

module.exports = { checkLeetCode };
