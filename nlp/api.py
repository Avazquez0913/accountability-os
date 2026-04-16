# api.py
# Flask REST API wrapping the NLP verification pipeline.
# Exposes verify.py as an HTTP endpoint so AccountabilityOS backend can call it.
#
# Endpoints:
#   POST /verify   — verify a claim against evidence text
#   GET  /health   — health check

from flask import Flask, request, jsonify
from verify import verify_task

app = Flask(__name__)


@app.route('/health', methods=['GET'])
def health():
    """Health check — confirms the API is running."""
    return jsonify({'status': 'ok'}), 200


@app.route('/verify', methods=['POST'])
def verify():
    """
    Verify whether evidence supports a claim.

    Request body (JSON):
        {
            "claim":    "I studied BFS and DFS algorithms",
            "evidence": "Solved LeetCode 200 using BFS with a visited set..."
        }

    Response (JSON):
        {
            "claim":          "...",
            "evidence":       "...",
            "semantic_score": 0.72,
            "rule_score":     0.30,
            "final_score":    0.594,
            "verified":       true
        }

    Error response (400):
        { "error": "Missing required field: claim" }
    """
    data = request.get_json(silent=True)

    if not data:
        return jsonify({'error': 'Request body must be JSON'}), 400

    claim    = data.get('claim', '').strip()
    evidence = data.get('evidence', '').strip()

    if not claim:
        return jsonify({'error': 'Missing required field: claim'}), 400
    if not evidence:
        return jsonify({'error': 'Missing required field: evidence'}), 400

    result = verify_task(claim, evidence)
    return jsonify(result), 200


if __name__ == '__main__':
    import os
    port = int(os.environ.get('PORT', 5001))
    app.run(host='0.0.0.0', port=port, debug=False)
