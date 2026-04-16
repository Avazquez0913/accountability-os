# baseline.py
# TF-IDF keyword overlap baseline for comparison against verify.py.
# Uses cosine similarity on TF-IDF vectors instead of sentence embeddings.
# This is the "dumb" baseline the NLP pipeline is compared against.

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from dataset import load_dataset

# Threshold chosen to match verify.py for a fair comparison
BASELINE_THRESHOLD = 0.10


def tfidf_similarity(claim: str, evidence: str, vectorizer: TfidfVectorizer) -> float:
    """Compute cosine similarity between claim and evidence using TF-IDF vectors."""
    vectors = vectorizer.transform([claim, evidence])
    score = cosine_similarity(vectors[0], vectors[1])[0][0]
    return float(score)


def run_baseline(threshold: float = BASELINE_THRESHOLD) -> dict:
    """
    Fit a TF-IDF vectorizer on the full corpus (claim + evidence),
    then classify each pair and return predictions and scores.
    """
    df = load_dataset()

    # Fit vectorizer on all text so vocabulary is shared
    corpus = list(df['claim']) + list(df['evidence'])
    vectorizer = TfidfVectorizer(stop_words='english', ngram_range=(1, 2))
    vectorizer.fit(corpus)

    scores = []
    predictions = []

    for _, row in df.iterrows():
        score = tfidf_similarity(row['claim'], row['evidence'], vectorizer)
        scores.append(round(score, 4))
        predictions.append(1 if score >= threshold else 0)

    df['baseline_score'] = scores
    df['baseline_pred'] = predictions

    return df


if __name__ == '__main__':
    df = run_baseline()
    print("Baseline predictions (first 10 rows):")
    print(df[['claim', 'label', 'baseline_score', 'baseline_pred']].head(10).to_string())
