# evaluate.py
# Evaluation script for the NLP verification pipeline.
# Runs verify.py on the full dataset and computes:
#   accuracy, precision, recall, F1 — for both the NLP model and TF-IDF baseline.
# Prints a side-by-side comparison table.

from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, classification_report
from dataset import load_dataset
from verify import verify_task
from baseline import run_baseline


def evaluate_model(df) -> dict:
    """Run verify_task on every row and collect predictions."""
    predictions = []
    scores = []

    for _, row in df.iterrows():
        result = verify_task(row['claim'], row['evidence'])
        predictions.append(1 if result['verified'] else 0)
        scores.append(result['final_score'])

    return {'predictions': predictions, 'scores': scores}


def print_metrics(name: str, labels, preds) -> dict:
    """Compute and print classification metrics, return as dict."""
    acc  = accuracy_score(labels, preds)
    prec = precision_score(labels, preds, zero_division=0)
    rec  = recall_score(labels, preds, zero_division=0)
    f1   = f1_score(labels, preds, zero_division=0)

    print(f"\n{'='*40}")
    print(f"  {name}")
    print(f"{'='*40}")
    print(f"  Accuracy : {acc:.4f}")
    print(f"  Precision: {prec:.4f}")
    print(f"  Recall   : {rec:.4f}")
    print(f"  F1 Score : {f1:.4f}")
    print(f"\n{classification_report(labels, preds, target_names=['Not Verified', 'Verified'])}")

    return {'accuracy': acc, 'precision': prec, 'recall': rec, 'f1': f1}


if __name__ == '__main__':
    print("Loading dataset...")
    df = load_dataset()
    labels = df['label'].tolist()

    print("Running NLP model (sentence-transformers)...")
    model_output = evaluate_model(df)
    model_metrics = print_metrics("NLP Model (sentence-transformers)", labels, model_output['predictions'])

    print("Running TF-IDF baseline...")
    baseline_df = run_baseline()
    baseline_preds = baseline_df['baseline_pred'].tolist()
    baseline_metrics = print_metrics("Baseline (TF-IDF cosine)", labels, baseline_preds)

    # Side-by-side summary
    print("\n" + "="*50)
    print(f"{'Metric':<12} {'NLP Model':>12} {'TF-IDF Base':>12}")
    print("-"*50)
    for metric in ['accuracy', 'precision', 'recall', 'f1']:
        print(f"{metric:<12} {model_metrics[metric]:>12.4f} {baseline_metrics[metric]:>12.4f}")
    print("="*50)

    # Save scores to CSV for visualization
    import pandas as pd
    df['model_score'] = model_output['scores']
    df['model_pred']  = model_output['predictions']
    df['baseline_score'] = baseline_df['baseline_score']
    df['baseline_pred']  = baseline_df['baseline_pred']
    df.to_csv('results.csv', index=False)
    print("\nScores saved to results.csv")
