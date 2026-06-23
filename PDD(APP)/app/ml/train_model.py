"""
ML Model Training Script for Smart Medical Assistant.
Trains a RandomForestClassifier on disease-symptom data.
Run once: python app/ml/train_model.py
"""
import os
import sys
import pickle
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report

# All 55 symptoms (must match seed.sql)
ALL_SYMPTOMS = [
    'fever', 'cough', 'headache', 'fatigue', 'nausea', 'vomiting',
    'diarrhea', 'chest_pain', 'shortness_of_breath', 'joint_pain',
    'skin_rash', 'sore_throat', 'runny_nose', 'muscle_pain', 'abdominal_pain',
    'loss_of_appetite', 'weight_loss', 'excessive_thirst', 'frequent_urination',
    'blurred_vision', 'dizziness', 'sweating', 'chills', 'skin_yellowing',
    'dark_urine', 'eye_redness', 'skin_itching', 'dry_skin', 'hair_loss',
    'mood_swings', 'high_blood_pressure', 'low_energy', 'sneezing',
    'nasal_congestion', 'back_pain', 'neck_stiffness', 'sensitivity_to_light',
    'swollen_lymph_nodes', 'cold_hands_feet', 'difficulty_swallowing',
    'blood_in_urine', 'burning_urination', 'pelvic_pain', 'increased_hunger',
    'slow_healing_wounds', 'numbness_tingling', 'fluid_retention',
    'coughing_blood', 'night_sweats', 'red_eyes', 'loss_of_smell',
    'loss_of_taste', 'constipation', 'bloating', 'heartburn'
]

# Disease → symptom mapping (30 diseases)
DISEASE_DATA = {
    'Influenza (Flu)': ['fever','cough','headache','fatigue','muscle_pain','chills','sore_throat','runny_nose','sneezing','loss_of_appetite'],
    'COVID-19': ['fever','cough','fatigue','shortness_of_breath','headache','loss_of_smell','loss_of_taste','muscle_pain','sore_throat','chills'],
    'Dengue Fever': ['fever','headache','muscle_pain','joint_pain','skin_rash','nausea','vomiting','fatigue','chills','loss_of_appetite'],
    'Malaria': ['fever','chills','sweating','headache','nausea','vomiting','muscle_pain','fatigue','abdominal_pain','joint_pain'],
    'Typhoid Fever': ['fever','headache','abdominal_pain','diarrhea','constipation','fatigue','loss_of_appetite','nausea','vomiting','sweating'],
    'Tuberculosis (TB)': ['cough','coughing_blood','fever','night_sweats','weight_loss','fatigue','chest_pain','shortness_of_breath','loss_of_appetite','chills'],
    'Pneumonia': ['fever','cough','shortness_of_breath','chest_pain','fatigue','chills','nausea','vomiting','sweating','loss_of_appetite'],
    'Bronchitis': ['cough','chest_pain','fatigue','shortness_of_breath','fever','chills','sore_throat','runny_nose','headache','nasal_congestion'],
    'Asthma': ['shortness_of_breath','cough','chest_pain','fatigue','night_sweats','low_energy','coughing_blood','nasal_congestion'],
    'GERD (Acid Reflux)': ['heartburn','chest_pain','nausea','vomiting','abdominal_pain','bloating','difficulty_swallowing','loss_of_appetite','sore_throat','cough'],
    'Peptic Ulcer': ['abdominal_pain','heartburn','nausea','vomiting','bloating','loss_of_appetite','weight_loss','fatigue','dark_urine','chest_pain'],
    'Appendicitis': ['abdominal_pain','nausea','vomiting','fever','loss_of_appetite','constipation','bloating','diarrhea','fatigue','chills'],
    'Type 2 Diabetes': ['excessive_thirst','frequent_urination','blurred_vision','fatigue','slow_healing_wounds','numbness_tingling','increased_hunger','weight_loss','dry_skin','low_energy'],
    'Hypertension': ['high_blood_pressure','headache','dizziness','shortness_of_breath','chest_pain','blurred_vision','fatigue','nausea','fluid_retention','cold_hands_feet'],
    'Migraine': ['headache','nausea','vomiting','sensitivity_to_light','dizziness','fatigue','neck_stiffness','loss_of_appetite','blurred_vision','mood_swings'],
    'Rheumatoid Arthritis': ['joint_pain','fatigue','fever','weight_loss','fluid_retention','muscle_pain','neck_stiffness','loss_of_appetite','sweating','low_energy'],
    'Anemia': ['fatigue','dizziness','headache','cold_hands_feet','shortness_of_breath','chest_pain','low_energy','loss_of_appetite','hair_loss','high_blood_pressure'],
    'Urinary Tract Infection (UTI)': ['burning_urination','frequent_urination','pelvic_pain','blood_in_urine','fever','fatigue','nausea','abdominal_pain','dark_urine','loss_of_appetite'],
    'Kidney Stones': ['abdominal_pain','blood_in_urine','nausea','vomiting','frequent_urination','burning_urination','fever','chills','pelvic_pain','back_pain'],
    'Hepatitis B': ['skin_yellowing','dark_urine','fatigue','abdominal_pain','nausea','vomiting','fever','loss_of_appetite','joint_pain','weight_loss'],
    'Chickenpox': ['skin_rash','fever','fatigue','loss_of_appetite','headache','skin_itching','muscle_pain','chills','sore_throat','runny_nose'],
    'Measles': ['fever','skin_rash','cough','runny_nose','red_eyes','sensitivity_to_light','sore_throat','loss_of_appetite','fatigue','swollen_lymph_nodes'],
    'Mumps': ['fever','headache','fatigue','muscle_pain','loss_of_appetite','swollen_lymph_nodes','difficulty_swallowing','neck_stiffness','nausea','chills'],
    'Sinusitis': ['headache','nasal_congestion','runny_nose','fever','fatigue','sore_throat','loss_of_smell','cough','chills','neck_stiffness'],
    'Tonsillitis': ['sore_throat','fever','difficulty_swallowing','swollen_lymph_nodes','headache','fatigue','loss_of_appetite','runny_nose','chills','nasal_congestion'],
    'Conjunctivitis (Pink Eye)': ['eye_redness','red_eyes','skin_itching','runny_nose','fever','sore_throat','swollen_lymph_nodes','sensitivity_to_light','headache','fatigue'],
    'Eczema (Atopic Dermatitis)': ['skin_rash','skin_itching','dry_skin','low_energy','fatigue','sensitivity_to_light','mood_swings','hair_loss','nasal_congestion','swollen_lymph_nodes'],
    'Psoriasis': ['skin_rash','skin_itching','joint_pain','fatigue','dry_skin','hair_loss','mood_swings','low_energy','swollen_lymph_nodes','back_pain'],
    'Hypothyroidism': ['fatigue','weight_loss','cold_hands_feet','constipation','dry_skin','hair_loss','mood_swings','low_energy','slow_healing_wounds','blurred_vision'],
    'Depression': ['fatigue','loss_of_appetite','weight_loss','mood_swings','low_energy','headache','numbness_tingling','hair_loss','sleep_issues','difficulty_swallowing'],
}

def build_training_data():
    """Build a DataFrame of disease-symptom binary matrix with augmentation."""
    rows = []
    labels = []
    
    for disease, symptoms in DISEASE_DATA.items():
        # Generate multiple augmented samples per disease
        for i in range(40):
            row = {s: 0 for s in ALL_SYMPTOMS}
            # Add primary symptoms with some random dropout for variety
            n_drop = np.random.randint(0, 3)
            active_symptoms = symptoms.copy()
            if n_drop > 0 and len(active_symptoms) > n_drop + 3:
                drop_indices = np.random.choice(len(active_symptoms), n_drop, replace=False)
                active_symptoms = [s for i, s in enumerate(active_symptoms) if i not in drop_indices]
            
            for s in active_symptoms:
                if s in row:
                    row[s] = 1
            
            # Add 1-2 random noise symptoms
            n_noise = np.random.randint(0, 3)
            noise_candidates = [s for s in ALL_SYMPTOMS if row[s] == 0]
            if noise_candidates and n_noise > 0:
                noise = np.random.choice(noise_candidates, min(n_noise, len(noise_candidates)), replace=False)
                for s in noise:
                    row[s] = 1

            rows.append(row)
            labels.append(disease)

    df = pd.DataFrame(rows)
    return df, labels

def train_and_save():
    """Train and save model."""
    print("Building training dataset...")
    X_df, y = build_training_data()
    
    le = LabelEncoder()
    y_enc = le.fit_transform(y)
    
    X_train, X_test, y_train, y_test = train_test_split(
        X_df.values, y_enc, test_size=0.2, random_state=42, stratify=y_enc
    )
    
    print(f"Training on {len(X_train)} samples, {len(le.classes_)} diseases...")
    clf = RandomForestClassifier(
        n_estimators=300,
        max_depth=None,
        min_samples_split=2,
        min_samples_leaf=1,
        random_state=42,
        n_jobs=-1
    )
    clf.fit(X_train, y_train)
    
    y_pred = clf.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    print(f"Test Accuracy: {acc:.4f} ({acc*100:.2f}%)")
    
    # Save model and metadata
    os.makedirs('ml_data', exist_ok=True)
    with open('ml_data/model.pkl', 'wb') as f:
        pickle.dump(clf, f)
    with open('ml_data/label_encoder.pkl', 'wb') as f:
        pickle.dump(le, f)
    with open('ml_data/features.pkl', 'wb') as f:
        pickle.dump(ALL_SYMPTOMS, f)
    
    print("Model saved to ml_data/")
    print(f"Features: {len(ALL_SYMPTOMS)}")
    print(f"Diseases: {len(le.classes_)}")
    print("Training complete!")
    return acc

if __name__ == '__main__':
    # Change to project root
    project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    os.chdir(project_root)
    train_and_save()
