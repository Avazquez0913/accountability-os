# visualize.py
# Generates evaluation visualizations for the NLP pipeline course report.
# Requires results.csv produced by evaluate.py.
# Outputs:
#   confusion_matrix.png  — 2x2 confusion matrix for both models
#   score_distribution.png — histogram of confidence scores by true label

import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.gridspec as gridspec
import numpy as np
from sklearn.metrics import confusion_matrix
import seaborn as sns
import os

RESULTS_FILE = 'results.csv'


def load_results() -> pd.DataFrame:
    if not os.path.exists(RESULTS_FILE):
        raise FileNotFoundError(f"{RESULTS_FILE} not found — run evaluate.py first.")
    return pd.read_csv(RESULTS_FILE)


def plot_confusion_matrices(df: pd.DataFrame):
    """Side-by-side confusion matrices for NLP model and TF-IDF baseline."""
    labels = df['label']
    model_preds    = df['model_pred']
    baseline_preds = df['baseline_pred']

    fig, axes = plt.subplots(1, 2, figsize=(12, 5))
    fig.suptitle('Confusion Matrices', fontsize=14, fontweight='bold')

    for ax, preds, title in zip(
        axes,
        [model_preds, baseline_preds],
        ['NLP Model (sentence-transformers)', 'Baseline (TF-IDF cosine)']
    ):
        cm = confusion_matrix(labels, preds)
        sns.heatmap(
            cm, annot=True, fmt='d', cmap='Blues', ax=ax,
            xticklabels=['Not Verified', 'Verified'],
            yticklabels=['Not Verified', 'Verified'],
        )
        ax.set_title(title)
        ax.set_xlabel('Predicted')
        ax.set_ylabel('Actual')

    plt.tight_layout()
    plt.savefig('confusion_matrix.png', dpi=150)
    print("Saved: confusion_matrix.png")
    plt.close()


def plot_score_distributions(df: pd.DataFrame):
    """Score distribution histograms split by true label (matching vs non-matching)."""
    fig, axes = plt.subplots(1, 2, figsize=(12, 5))
    fig.suptitle('Confidence Score Distributions by True Label', fontsize=14, fontweight='bold')

    for ax, score_col, title in zip(
        axes,
        ['model_score', 'baseline_score'],
        ['NLP Model (sentence-transformers)', 'Baseline (TF-IDF cosine)']
    ):
        matching     = df[df['label'] == 1][score_col]
        non_matching = df[df['label'] == 0][score_col]

        bins = np.linspace(0, 1, 20)
        ax.hist(matching,     bins=bins, alpha=0.7, label='Matching (label=1)',     color='steelblue')
        ax.hist(non_matching, bins=bins, alpha=0.7, label='Non-matching (label=0)', color='salmon')

        # Draw threshold line
        threshold = 0.35 if 'model' in score_col else 0.10
        ax.axvline(x=threshold, color='black', linestyle='--', linewidth=1.5, label=f'Threshold ({threshold})')

        ax.set_title(title)
        ax.set_xlabel('Confidence Score')
        ax.set_ylabel('Count')
        ax.legend()

    plt.tight_layout()
    plt.savefig('score_distribution.png', dpi=150)
    print("Saved: score_distribution.png")
    plt.close()


if __name__ == '__main__':
    df = load_results()
    plot_confusion_matrices(df)
    plot_score_distributions(df)
    print("Done. Open confusion_matrix.png and score_distribution.png to view results.")
