// nlpClient.js
// Responsibility: Call the NLP verification Flask API
// Used to verify reading/study evidence before awarding points

const NLP_API_URL = process.env.NLP_API_URL || 'http://localhost:5001';

const verifyEvidence = async (claim, evidence) => {
    const response = await fetch(`${NLP_API_URL}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claim, evidence }),
    });

    if (!response.ok) {
        const body = await response.text();
        throw new Error(`NLP API error ${response.status}: ${body}`);
    }

    return response.json();
};

module.exports = { verifyEvidence };
