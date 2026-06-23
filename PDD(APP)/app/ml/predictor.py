import numpy as np
import os
import joblib
from flask import current_app

# Cache for loaded model and metadata
_model_cache = {}

def _load_model():
    """Load the trained model and supporting data from disk (cached)."""
    global _model_cache
    if _model_cache:
        return True
    
    # Model is stored in the root ml_model directory
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    model_dir = os.path.join(base_dir, 'ml_model')
    
    model_path = os.path.join(model_dir, 'disease_model.pkl')
    meta_path  = os.path.join(model_dir, 'model_meta.pkl')

    if not os.path.exists(model_path):
        print(f"Trained model not found at {model_path}. Run ml_model/train.py first.")
        return False

    try:
        _model_cache['model']    = joblib.load(model_path)
        meta                     = joblib.load(meta_path)
        _model_cache['symptoms'] = meta['symptoms']   # order of features
        _model_cache['diseases'] = meta['diseases']   # class labels
        return True
    except Exception as e:
        print(f"Error loading model: {e}")
        return False


def predict_disease(user_symptoms: list):
    """
    Predict disease from user symptoms.
    
    Args:
        user_symptoms: list of symptom names (e.g. ['fever', 'cough'])
    
    Returns:
        dict with top-3 predictions and confidence scores
    """
    if not _load_model():
        return None

    model = _model_cache['model']
    all_symptoms = _model_cache['symptoms']

    # Build one-hot feature vector
    X = np.zeros(len(all_symptoms))
    for s in user_symptoms:
        s_clean = s.strip().lower().replace(' ', '_')
        if s_clean in all_symptoms:
            X[all_symptoms.index(s_clean)] = 1

    # Get class probabilities
    probs = model.predict_proba([X])[0]
    classes = model.classes_

    # Sort results by probability descending
    sorted_pairs = sorted(zip(classes, probs), key=lambda x: x[1], reverse=True)

    top1_name, top1_conf = sorted_pairs[0]
    top2_name, top2_conf = sorted_pairs[1] if len(sorted_pairs) > 1 else (None, 0)
    top3_name, top3_conf = sorted_pairs[2] if len(sorted_pairs) > 2 else (None, 0)

    return [
        {
            'disease': str(top1_name),
            'confidence': round(float(top1_conf) * 100, 2)
        },
        {
            'disease': str(top2_name),
            'confidence': round(float(top2_conf) * 100, 2)
        },
        {
            'disease': str(top3_name),
            'confidence': round(float(top3_conf) * 100, 2)
        }
    ]
