# verify.py
# AccountabilityOS NLP Verification Pipeline
# Core module: given a user claim and submitted evidence text,
# returns a confidence score and binary verified decision.

from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

# Load once at import time — reused across all calls
model = SentenceTransformer('all-MiniLM-L6-v2')

# Keywords that signal task-relevant content
TECHNICAL_KEYWORDS = {
    'bfs', 'dfs', 'graph', 'algorithm', 'leetcode', 'commit', 'coding',
    'workout', 'applied', 'studied', 'push', 'merge', 'recursion', 'dynamic',
    'reading', 'chapter', 'exercise', 'interview', 'resume', 'offer', 'sets',
    'tree', 'stack', 'queue', 'array', 'hash', 'sort', 'search', 'pointer'
}


def compute_embedding_similarity(claim: str, evidence: str) -> float:
    """Encode claim and evidence as sentence embeddings, return cosine similarity."""
    embeddings = model.encode([claim, evidence])
    score = cosine_similarity([embeddings[0]], [embeddings[1]])[0][0]
    return float(score)


def rule_based_score(claim: str, evidence: str) -> float:
    """
    Apply lightweight rule-based checks on top of semantic similarity.
    Returns a boost value in [0.0, 0.3].
    Rules:
      +0.1 if evidence has >= 20 words (substantial response)
      +0.1 if claim and evidence share >= 3 content words
      +0.1 if evidence contains task-relevant technical keywords
    """
    score = 0.0

    if len(evidence.split()) >= 20:
        score += 0.1

    claim_words = set(claim.lower().split())
    evidence_words = set(evidence.lower().split())

    if len(claim_words & evidence_words) >= 3:
        score += 0.1

    if any(word in evidence_words for word in TECHNICAL_KEYWORDS):
        score += 0.1

    return score


def verify_task(claim: str, evidence: str) -> dict:
    """
    Main verification function.
    Combines 70% semantic similarity + 30% rule-based score.
    Threshold: final_score >= 0.35 → verified.

    Returns a dict with all intermediate scores for transparency.
    """
    semantic_score = compute_embedding_similarity(claim, evidence)
    rule_score = rule_based_score(claim, evidence)
    final_score = (0.7 * semantic_score) + (0.3 * rule_score)

    return {
        'claim': claim,
        'evidence': evidence,
        'semantic_score': round(semantic_score, 4),
        'rule_score': round(rule_score, 4),
        'final_score': round(final_score, 4),
        'verified': final_score >= 0.35,
    }


if __name__ == '__main__':
    # Quick smoke test
    r1 = verify_task(
        claim="I studied BFS and DFS graph algorithms today",
        evidence="Solved LeetCode 200 Number of Islands using BFS. Also implemented DFS on a grid. The key insight was using a visited array to track explored nodes."
    )
    print("Test 1 — should VERIFY:", r1)

    r2 = verify_task(
        claim="I studied BFS and DFS graph algorithms today",
        evidence="Watched Netflix and played video games all day. Did not do any coding or studying."
    )
    print("Test 2 — should NOT VERIFY:", r2)
