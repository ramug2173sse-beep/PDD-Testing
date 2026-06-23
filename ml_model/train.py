"""
ML Model Trainer for SMAT – Smart Medical Assistant
====================================================
Run this script ONCE to train the RandomForestClassifier and save
the model + metadata to the ml_model/ directory.

Usage:
    python ml_model/train.py
"""
import os
import sys
import json
import numpy as np
import joblib

# Add project root to path so we can import app modules
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app
from app.db import query_db

from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score


OUTPUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'ml_model')

# ── Disease → symptom mapping (mirrors seed.sql) ────────────────────────────
TRAINING_DATA = {
    "Influenza (Flu)": ["fever","cough","headache","fatigue","muscle_pain","chills","sore_throat","runny_nose","sneezing","loss_of_appetite"],
    "COVID-19": ["fever","cough","fatigue","shortness_of_breath","headache","loss_of_smell","loss_of_taste","muscle_pain","sore_throat","chills"],
    "Dengue Fever": ["fever","headache","muscle_pain","joint_pain","skin_rash","nausea","vomiting","fatigue","chills","loss_of_appetite"],
    "Malaria": ["fever","chills","sweating","headache","nausea","vomiting","muscle_pain","fatigue","abdominal_pain","joint_pain"],
    "Typhoid Fever": ["fever","headache","abdominal_pain","diarrhea","constipation","fatigue","loss_of_appetite","nausea","vomiting","sweating"],
    "Tuberculosis (TB)": ["cough","coughing_blood","fever","night_sweats","weight_loss","fatigue","chest_pain","shortness_of_breath","loss_of_appetite","chills"],
    "Pneumonia": ["fever","cough","shortness_of_breath","chest_pain","fatigue","chills","nausea","vomiting","sweating","loss_of_appetite"],
    "Bronchitis": ["cough","chest_pain","fatigue","shortness_of_breath","fever","chills","sore_throat","runny_nose","headache"],
    "Asthma": ["shortness_of_breath","cough","chest_pain","wheezing","fatigue","night_sweats"],
    "GERD (Acid Reflux)": ["heartburn","chest_pain","nausea","vomiting","abdominal_pain","bloating","difficulty_swallowing","loss_of_appetite","sore_throat","cough"],
    "Peptic Ulcer": ["abdominal_pain","heartburn","nausea","vomiting","bloating","loss_of_appetite","weight_loss","fatigue","dark_urine","chest_pain"],
    "Appendicitis": ["abdominal_pain","nausea","vomiting","fever","loss_of_appetite","constipation","bloating","diarrhea","fatigue","chills"],
    "Type 2 Diabetes": ["excessive_thirst","frequent_urination","blurred_vision","fatigue","slow_healing_wounds","numbness_tingling","increased_hunger","weight_loss","dry_skin","low_energy"],
    "Hypertension": ["high_blood_pressure","headache","dizziness","shortness_of_breath","chest_pain","blurred_vision","fatigue","nausea","fluid_retention","cold_hands_feet"],
    "Migraine": ["headache","nausea","vomiting","sensitivity_to_light","dizziness","fatigue","neck_stiffness","loss_of_appetite","blurred_vision","mood_swings"],
    "Rheumatoid Arthritis": ["joint_pain","fatigue","fever","weight_loss","fluid_retention","muscle_pain","neck_stiffness","loss_of_appetite","sweating","low_energy"],
    "Anemia": ["fatigue","dizziness","headache","cold_hands_feet","shortness_of_breath","chest_pain","low_energy","pale_skin","loss_of_appetite","hair_loss"],
    "Urinary Tract Infection (UTI)": ["burning_urination","frequent_urination","pelvic_pain","blood_in_urine","fever","fatigue","nausea","abdominal_pain","dark_urine","loss_of_appetite"],
    "Kidney Stones": ["abdominal_pain","blood_in_urine","nausea","vomiting","frequent_urination","burning_urination","fever","chills","pelvic_pain","back_pain"],
    "Hepatitis B": ["skin_yellowing","dark_urine","fatigue","abdominal_pain","nausea","vomiting","fever","loss_of_appetite","joint_pain","weight_loss"],
    "Chickenpox": ["skin_rash","fever","fatigue","loss_of_appetite","headache","skin_itching","muscle_pain","chills","sore_throat","runny_nose"],
    "Measles": ["fever","skin_rash","cough","runny_nose","red_eyes","sensitivity_to_light","sore_throat","loss_of_appetite","fatigue","swollen_lymph_nodes"],
    "Mumps": ["fever","headache","fatigue","muscle_pain","loss_of_appetite","swollen_lymph_nodes","difficulty_swallowing","neck_stiffness","nausea","chills"],
    "Sinusitis": ["headache","nasal_congestion","runny_nose","fever","fatigue","sore_throat","loss_of_smell","cough","chills","neck_stiffness"],
    "Tonsillitis": ["sore_throat","fever","difficulty_swallowing","swollen_lymph_nodes","headache","fatigue","loss_of_appetite","runny_nose","chills"],
    "Conjunctivitis (Pink Eye)": ["eye_redness","red_eyes","skin_itching","runny_nose","fever","sore_throat","swollen_lymph_nodes","sensitivity_to_light","headache","fatigue"],
    "Eczema (Atopic Dermatitis)": ["skin_rash","skin_itching","dry_skin","low_energy","fatigue","sensitivity_to_light","mood_swings"],
    "Psoriasis": ["skin_rash","skin_itching","joint_pain","fatigue","dry_skin","hair_loss","mood_swings","low_energy","swollen_lymph_nodes"],
    "Hypothyroidism": ["fatigue","weight_loss","cold_hands_feet","constipation","dry_skin","hair_loss","mood_swings","low_energy","slow_healing_wounds","blurred_vision"],
    "Depression": ["fatigue","loss_of_appetite","weight_loss","mood_swings","low_energy","headache","difficulty_swallowing","numbness_tingling","hair_loss"],
}

# Augment each disease with variants so the model gets enough samples
def augment(symptoms, n_samples=80, drop_rate=0.2):
    """Generate augmented training samples by randomly dropping some symptoms."""
    samples = []
    rng = np.random.default_rng(42)
    for _ in range(n_samples):
        kept = [s for s in symptoms if rng.random() > drop_rate]
        if not kept:
            kept = symptoms[:2]
        samples.append(kept)
    return samples


def build_dataset():
    all_symptoms = sorted({s for symptoms in TRAINING_DATA.values() for s in symptoms})
    X, y = [], []
    for disease, symptoms in TRAINING_DATA.items():
        for sample in augment(symptoms):
            vec = [1 if s in sample else 0 for s in all_symptoms]
            X.append(vec)
            y.append(disease)
    return np.array(X), np.array(y), all_symptoms


def train():
    print("Building training dataset ...")
    X, y, all_symptoms = build_dataset()
    print(f"  Diseases : {len(TRAINING_DATA)}")
    print(f"  Symptoms : {len(all_symptoms)}")
    print(f"  Samples  : {len(X)}")

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.15, random_state=42)

    print("\nTraining RandomForestClassifier ...")
    clf = RandomForestClassifier(n_estimators=200, max_depth=None, random_state=42, n_jobs=-1)
    clf.fit(X_train, y_train)

    y_pred = clf.predict(X_test)
    acc    = accuracy_score(y_test, y_pred)
    print(f"  Accuracy : {acc * 100:.1f}%")
    print(classification_report(y_test, y_pred, zero_division=0))

    # Save model and metadata
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    model_path = os.path.join(OUTPUT_DIR, 'disease_model.pkl')
    meta_path  = os.path.join(OUTPUT_DIR, 'model_meta.pkl')

    joblib.dump(clf, model_path)
    joblib.dump({'symptoms': all_symptoms, 'diseases': list(clf.classes_)}, meta_path)
    print(f"\n[OK] Model saved   : {model_path}")
    print(f"[OK] Metadata saved: {meta_path}")
    print("\nTraining completed successfully!")


if __name__ == '__main__':
    train()
