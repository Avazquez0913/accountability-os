# verify.py
# AccountabilityOS - NLP Verification Pipeline
# Task: Given a user claim and submitted evidence,
# compute a confidence score that the task was completed

from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

# Load pretrained sentence embedding model
# all-MiniLM-L6-v2 is fast, lightweight, and accurate
model = SentenceTransformer('all-MiniLM-L6-v2')

def compute_embedding_similarity(claim, evidence):
    """
    Convert claim and evidence to 
    mbeddings
    and compute cosine similarity between them
    """
    embeddings = model.encode([claim, evidence])
    score = cosine_similarity([embeddings[0]], [embeddings[1]])[0][0]
    return float(score)

def rule_based_score(claim, evidence):
    """
    Apply simple rule-based checks to boost or reduce confidence
    Rules are based on keyword overlap and evidence length
    """
    score = 0.0

    # Check if evidence is long enough to be meaningful
    if len(evidence.split()) >= 20:
        score += 0.1

    # Check for keyword overlap between claim and evidence
    claim_words = set(claim.lower().split())
    evidence_words = set(evidence.lower().split())
    overlap = claim_words.intersection(evidence_words)
    if len(overlap) >= 3:
        score += 0.1

    technical_keywords = {'bfs', 'dfs', 'graph', 'algorithm', 'leetcode', 'algorithm', "graph", "commit", "coding", "workout", "applied", "studied"
    
    }

    if any(word in evidence_words for word in technical_keywords):
        score += 0.1

    return score

def verify_task(claim, evidence):
    """
    Main verification function
    Combines embedding similarity and rule-based score
    Returns final confidence score and decision
    """
    # Compute semantic similarity
    semantic_score = compute_embedding_similarity(claim, evidence)

    # Compute rule-based boost
    rule_score = rule_based_score(claim, evidence)

    # Combine scores with weights
    # 70% semantic similarity, 30% rule-based
    final_score = (0.7 * semantic_score) + (0.3 * rule_score)

    # Decision threshold
    verified = final_score >= 0.35

    return {
        'claim': claim,
        'evidence': evidence,
        'semantic_score': round(semantic_score, 4),
        'rule_score': round(rule_score, 4),
        'final_score': round(final_score, 4),
        'verified': verified
    }

# Test with example pairs
if __name__ == '__main__':
    
    # Matching pair - should verify
    result1 = verify_task(
        claim="I studied BFS and DFS graph algorithms today",
        evidence="Solved LeetCode 200 Number of Islands using BFS. Also implemented DFS on a grid. The key insight was using a visited array to track explored nodes."
    )
    print("Test 1 - Should VERIFY:")
    print(result1)
    print()

    # Non-matching pair - should not verify
    result2 = verify_task(
        claim="I studied BFS and DFS graph algorithms today",
        evidence="Watched Netflix and played video games all day. Did not do any coding or studying."
    )
    print("Test 2 - Should NOT VERIFY:")
    print(result2)