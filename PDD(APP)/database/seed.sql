USE smat_db;

-- ============================================================
-- SYMPTOMS (55 symptoms)
-- ============================================================
INSERT IGNORE INTO symptoms (name, description, category, severity_level) VALUES
('fever', 'Elevated body temperature above 98.6°F (37°C)', 'General', 'moderate'),
('cough', 'Reflex action to clear the airways', 'Respiratory', 'mild'),
('headache', 'Pain in the head or upper neck region', 'Neurological', 'mild'),
('fatigue', 'Extreme tiredness and lack of energy', 'General', 'mild'),
('nausea', 'Sensation of unease and discomfort in the stomach', 'Gastrointestinal', 'mild'),
('vomiting', 'Forceful emptying of the stomach contents', 'Gastrointestinal', 'moderate'),
('diarrhea', 'Loose, watery bowel movements', 'Gastrointestinal', 'moderate'),
('chest_pain', 'Discomfort or pain in the chest area', 'Cardiovascular', 'severe'),
('shortness_of_breath', 'Difficulty breathing or feeling of breathlessness', 'Respiratory', 'severe'),
('joint_pain', 'Pain or discomfort in one or more joints', 'Musculoskeletal', 'moderate'),
('skin_rash', 'Change in color or texture of the skin', 'Dermatological', 'mild'),
('sore_throat', 'Pain or irritation in the throat', 'ENT', 'mild'),
('runny_nose', 'Excess discharge of mucus from the nose', 'ENT', 'mild'),
('muscle_pain', 'Aching or soreness in the muscles', 'Musculoskeletal', 'mild'),
('abdominal_pain', 'Pain or discomfort in the stomach area', 'Gastrointestinal', 'moderate'),
('loss_of_appetite', 'Reduced desire to eat', 'General', 'mild'),
('weight_loss', 'Unintentional decrease in body weight', 'General', 'moderate'),
('excessive_thirst', 'Unusually strong need to drink fluids', 'Metabolic', 'moderate'),
('frequent_urination', 'Need to urinate more often than usual', 'Urological', 'mild'),
('blurred_vision', 'Loss of sharpness of eyesight', 'Ophthalmic', 'moderate'),
('dizziness', 'Feeling of being lightheaded or unsteady', 'Neurological', 'moderate'),
('sweating', 'Excessive perspiration', 'General', 'mild'),
('chills', 'Feeling cold with shivering', 'General', 'moderate'),
('skin_yellowing', 'Yellowing of skin and eyes (jaundice)', 'Hepatic', 'severe'),
('dark_urine', 'Urine that is darker than usual', 'Urological', 'moderate'),
('eye_redness', 'Redness or irritation of the eyes', 'Ophthalmic', 'mild'),
('skin_itching', 'Uncomfortable sensation causing desire to scratch', 'Dermatological', 'mild'),
('dry_skin', 'Skin that lacks moisture', 'Dermatological', 'mild'),
('hair_loss', 'Loss of hair from scalp or body', 'Dermatological', 'mild'),
('mood_swings', 'Rapid or extreme changes in mood', 'Psychological', 'moderate'),
('high_blood_pressure', 'Blood pressure above normal range 120/80', 'Cardiovascular', 'severe'),
('low_energy', 'Persistent lack of energy or motivation', 'General', 'mild'),
('sneezing', 'Sudden, forceful expulsion of air from nose', 'ENT', 'mild'),
('nasal_congestion', 'Blockage of the nasal passages', 'ENT', 'mild'),
('back_pain', 'Pain in the lower, middle, or upper back', 'Musculoskeletal', 'moderate'),
('neck_stiffness', 'Difficulty moving the neck or stiffness', 'Musculoskeletal', 'moderate'),
('sensitivity_to_light', 'Discomfort or pain caused by light', 'Neurological', 'moderate'),
('swollen_lymph_nodes', 'Enlarged lymph nodes, often in neck or armpits', 'Immunological', 'moderate'),
('cold_hands_feet', 'Hands or feet feeling unusually cold', 'Cardiovascular', 'mild'),
('difficulty_swallowing', 'Trouble swallowing food or liquids', 'ENT', 'moderate'),
('blood_in_urine', 'Presence of blood in the urine', 'Urological', 'severe'),
('burning_urination', 'Burning sensation during urination', 'Urological', 'moderate'),
('pelvic_pain', 'Pain in the lower abdominal pelvic region', 'Urological', 'moderate'),
('increased_hunger', 'Feeling unusually hungry even after eating', 'Metabolic', 'mild'),
('slow_healing_wounds', 'Wounds or cuts that take longer to heal', 'Metabolic', 'moderate'),
('numbness_tingling', 'Loss of sensation or tingling in limbs', 'Neurological', 'moderate'),
('fluid_retention', 'Swelling due to buildup of fluids', 'Cardiovascular', 'moderate'),
('coughing_blood', 'Blood present in cough or sputum', 'Respiratory', 'severe'),
('night_sweats', 'Excessive sweating during sleep', 'General', 'moderate'),
('red_eyes', 'Eyes appearing red due to irritation or infection', 'Ophthalmic', 'mild'),
('loss_of_smell', 'Reduced or absent sense of smell', 'ENT', 'mild'),
('loss_of_taste', 'Reduced or absent sense of taste', 'ENT', 'mild'),
('constipation', 'Difficulty having bowel movements', 'Gastrointestinal', 'mild'),
('bloating', 'Feeling of fullness or swelling in the abdomen', 'Gastrointestinal', 'mild'),
('heartburn', 'Burning sensation in the chest after eating', 'Gastrointestinal', 'mild');

-- ============================================================
-- DISEASES (30 diseases)
-- ============================================================
INSERT IGNORE INTO diseases (name, description, category, severity, treatment, prevention, specialist_required, is_contagious) VALUES
('Influenza (Flu)', 'A contagious respiratory illness caused by influenza viruses.', 'Respiratory', 'moderate', 'Rest, fluids, antiviral medications like oseltamivir. Fever reducers.', 'Annual flu vaccine, frequent handwashing, avoiding close contact with sick people.', 'General Physician', TRUE),
('COVID-19', 'Infectious disease caused by SARS-CoV-2 coronavirus.', 'Respiratory', 'severe', 'Supportive care, antivirals (Paxlovid), oxygen therapy for severe cases.', 'Vaccination, masking, hand hygiene, social distancing.', 'Pulmonologist', TRUE),
('Dengue Fever', 'Mosquito-borne viral disease causing high fever and severe pain.', 'Vector-borne', 'severe', 'Supportive treatment: rest, fluids, acetaminophen (avoid aspirin/NSAIDs).', 'Mosquito repellent, eliminate standing water, wear protective clothing.', 'Infectious Disease Specialist', FALSE),
('Malaria', 'Parasitic disease transmitted by Anopheles mosquitoes.', 'Vector-borne', 'severe', 'Antimalarial drugs: chloroquine, artemisinin-based combination therapy (ACT).', 'Insecticide-treated nets, antimalarial prophylaxis, mosquito control.', 'Infectious Disease Specialist', FALSE),
('Typhoid Fever', 'Bacterial infection caused by Salmonella typhi through contaminated food/water.', 'Bacterial', 'severe', 'Antibiotics: ciprofloxacin, azithromycin. Rest and hydration.', 'Typhoid vaccine, safe drinking water, proper food hygiene.', 'General Physician', TRUE),
('Tuberculosis (TB)', 'Infectious disease mainly affecting the lungs caused by Mycobacterium tuberculosis.', 'Respiratory', 'severe', 'DOTS therapy: 6-month course of antibiotics (isoniazid, rifampin, pyrazinamide, ethambutol).', 'BCG vaccination, good ventilation, early diagnosis and treatment.', 'Pulmonologist', TRUE),
('Pneumonia', 'Infection that inflames air sacs in one or both lungs.', 'Respiratory', 'severe', 'Antibiotics for bacterial pneumonia, antivirals for viral pneumonia. Rest and fluids.', 'Pneumococcal vaccine, flu vaccine, good hygiene.', 'Pulmonologist', TRUE),
('Bronchitis', 'Inflammation of the bronchial tubes lining.', 'Respiratory', 'moderate', 'Rest, fluids, bronchodilators. Cough suppressants. Antibiotics if bacterial.', 'Avoiding smoking, reducing exposure to pollutants, flu vaccination.', 'General Physician', FALSE),
('Asthma', 'Chronic condition causing airway inflammation and narrowing.', 'Respiratory', 'moderate', 'Bronchodilator inhalers (albuterol), corticosteroid inhalers, avoiding triggers.', 'Avoiding triggers, using air purifiers, regular monitoring.', 'Pulmonologist', FALSE),
('GERD (Acid Reflux)', 'Chronic digestive disease with stomach acid flowing up into esophagus.', 'Gastrointestinal', 'mild', 'Antacids, H2 blockers, proton pump inhibitors (omeprazole). Lifestyle changes.', 'Maintaining healthy weight, avoiding trigger foods, not lying down after eating.', 'Gastroenterologist', FALSE),
('Peptic Ulcer', 'Open sores on lining of stomach, upper small intestine, or esophagus.', 'Gastrointestinal', 'moderate', 'Proton pump inhibitors, antibiotics for H. pylori, avoiding NSAIDs.', 'Avoiding NSAIDs, limiting alcohol, not smoking, treating H. pylori.', 'Gastroenterologist', FALSE),
('Appendicitis', 'Inflammation of the appendix requiring emergency treatment.', 'Gastrointestinal', 'critical', 'Surgical removal (appendectomy). Antibiotics pre/post surgery.', 'No specific prevention. High-fiber diet may reduce risk.', 'Surgeon', FALSE),
('Type 2 Diabetes', 'Metabolic disease causing high blood sugar due to insulin resistance.', 'Endocrine', 'moderate', 'Lifestyle changes, metformin, insulin therapy, blood sugar monitoring.', 'Healthy diet, regular exercise, maintaining healthy weight.', 'Endocrinologist', FALSE),
('Hypertension', 'Persistently elevated blood pressure in arteries.', 'Cardiovascular', 'severe', 'Antihypertensives (ACE inhibitors, beta-blockers, diuretics). Lifestyle changes.', 'Reducing sodium, regular exercise, maintaining healthy weight, limiting alcohol.', 'Cardiologist', FALSE),
('Migraine', 'Recurrent headache disorder with moderate to severe pulsating pain.', 'Neurological', 'moderate', 'Triptans, pain relievers, anti-nausea medications. Preventive medications.', 'Identifying and avoiding triggers, regular sleep, stress management.', 'Neurologist', FALSE),
('Rheumatoid Arthritis', 'Chronic inflammatory disorder affecting joints throughout the body.', 'Musculoskeletal', 'moderate', 'DMARDs (methotrexate), biologics, NSAIDs, corticosteroids, physical therapy.', 'No proven prevention. Early diagnosis and treatment slow progression.', 'Rheumatologist', FALSE),
('Anemia', 'Condition where blood lacks enough healthy red blood cells.', 'Hematological', 'moderate', 'Iron supplements, B12/folate supplementation, treating underlying cause.', 'Balanced diet rich in iron, vitamins B12 and folate.', 'Hematologist', FALSE),
('Urinary Tract Infection (UTI)', 'Bacterial infection in any part of the urinary system.', 'Urological', 'moderate', 'Antibiotics (trimethoprim, nitrofurantoin). Increased fluid intake.', 'Drinking plenty of water, proper hygiene, urinating after intercourse.', 'Urologist', FALSE),
('Kidney Stones', 'Hard deposits of minerals and salts that form in the kidneys.', 'Urological', 'severe', 'Pain management (NSAIDs), hydration, lithotripsy, surgical removal for large stones.', 'Drinking plenty of water, reducing oxalate-rich foods, limiting sodium.', 'Urologist', FALSE),
('Hepatitis B', 'Viral infection targeting the liver, potentially causing chronic disease.', 'Hepatic', 'severe', 'Antiviral medications (tenofovir, entecavir). Liver transplant in severe cases.', 'Hepatitis B vaccine, safe sex, not sharing needles.', 'Gastroenterologist', TRUE),
('Chickenpox', 'Highly contagious viral infection causing itchy blister-like rash.', 'Viral', 'mild', 'Antihistamines for itching, antiviral acyclovir for high-risk patients. Calamine lotion.', 'Varicella vaccine is the best prevention.', 'General Physician', TRUE),
('Measles', 'Highly contagious viral disease with rash and respiratory symptoms.', 'Viral', 'moderate', 'Supportive care: rest, fluids, fever reducers. Vitamin A supplementation.', 'MMR (measles-mumps-rubella) vaccine. Two doses for full protection.', 'General Physician', TRUE),
('Mumps', 'Viral disease affecting salivary glands causing swelling.', 'Viral', 'moderate', 'Supportive care: rest, fluids, pain relievers. No specific antiviral treatment.', 'MMR vaccine provides protection against mumps.', 'General Physician', TRUE),
('Sinusitis', 'Inflammation of the sinuses, often following a cold.', 'ENT', 'mild', 'Decongestants, nasal corticosteroids, saline irrigation. Antibiotics if bacterial.', 'Good hygiene, treating allergies, avoiding pollutants.', 'ENT Specialist', FALSE),
('Tonsillitis', 'Inflammation of the tonsils, usually caused by viral or bacterial infection.', 'ENT', 'mild', 'Rest, fluids, pain relievers. Antibiotics for strep (amoxicillin). Tonsillectomy if recurrent.', 'Good hand hygiene, avoiding contact with infected individuals.', 'ENT Specialist', TRUE),
('Conjunctivitis (Pink Eye)', 'Inflammation of the conjunctiva of the eye.', 'Ophthalmic', 'mild', 'Antibiotic eye drops for bacterial. Antihistamine drops for allergic. Cool compresses.', 'Frequent handwashing, not touching eyes, not sharing personal items.', 'Ophthalmologist', TRUE),
('Eczema (Atopic Dermatitis)', 'Chronic skin condition causing dry, itchy, inflamed skin patches.', 'Dermatological', 'mild', 'Moisturizers, topical corticosteroids, immunosuppressants, avoiding triggers.', 'Moisturizing regularly, using mild soaps, avoiding known triggers.', 'Dermatologist', FALSE),
('Psoriasis', 'Chronic autoimmune skin disease causing red, scaly patches.', 'Dermatological', 'moderate', 'Topical treatments, phototherapy, biologics (adalimumab), methotrexate.', 'Stress management, avoiding triggers, keeping skin moisturized.', 'Dermatologist', FALSE),
('Hypothyroidism', 'Underactive thyroid gland that does not produce enough thyroid hormone.', 'Endocrine', 'moderate', 'Levothyroxine (thyroid hormone replacement). Regular monitoring of TSH levels.', 'Regular thyroid check-ups, adequate iodine intake.', 'Endocrinologist', FALSE),
('Depression', 'Mental health disorder characterized by persistent low mood and loss of interest.', 'Psychological', 'moderate', 'Psychotherapy (CBT), antidepressants (SSRIs), lifestyle changes, support groups.', 'Regular exercise, social connections, stress management, adequate sleep.', 'Psychiatrist', FALSE);

-- ============================================================
-- DISEASE-SYMPTOM MAPPINGS
-- ============================================================
-- Helper: We use symptom names here for readability
-- Influenza (id=1)
INSERT IGNORE INTO disease_symptoms (disease_id, symptom_id, weight)
SELECT 1, id, 1.0 FROM symptoms WHERE name IN ('fever','cough','headache','fatigue','muscle_pain','chills','sore_throat','runny_nose','sneezing','loss_of_appetite');

-- COVID-19 (id=2)
INSERT IGNORE INTO disease_symptoms (disease_id, symptom_id, weight)
SELECT 2, id, 1.0 FROM symptoms WHERE name IN ('fever','cough','fatigue','shortness_of_breath','headache','loss_of_smell','loss_of_taste','muscle_pain','sore_throat','chills');

-- Dengue (id=3)
INSERT IGNORE INTO disease_symptoms (disease_id, symptom_id, weight)
SELECT 3, id, 1.0 FROM symptoms WHERE name IN ('fever','headache','muscle_pain','joint_pain','skin_rash','nausea','vomiting','fatigue','chills','loss_of_appetite');

-- Malaria (id=4)
INSERT IGNORE INTO disease_symptoms (disease_id, symptom_id, weight)
SELECT 4, id, 1.0 FROM symptoms WHERE name IN ('fever','chills','sweating','headache','nausea','vomiting','muscle_pain','fatigue','abdominal_pain','joint_pain');

-- Typhoid (id=5)
INSERT IGNORE INTO disease_symptoms (disease_id, symptom_id, weight)
SELECT 5, id, 1.0 FROM symptoms WHERE name IN ('fever','headache','abdominal_pain','diarrhea','constipation','fatigue','loss_of_appetite','nausea','vomiting','sweating');

-- Tuberculosis (id=6)
INSERT IGNORE INTO disease_symptoms (disease_id, symptom_id, weight)
SELECT 6, id, 1.0 FROM symptoms WHERE name IN ('cough','coughing_blood','fever','night_sweats','weight_loss','fatigue','chest_pain','shortness_of_breath','loss_of_appetite','chills');

-- Pneumonia (id=7)
INSERT IGNORE INTO disease_symptoms (disease_id, symptom_id, weight)
SELECT 7, id, 1.0 FROM symptoms WHERE name IN ('fever','cough','shortness_of_breath','chest_pain','fatigue','chills','nausea','vomiting','sweating','loss_of_appetite');

-- Bronchitis (id=8)
INSERT IGNORE INTO disease_symptoms (disease_id, symptom_id, weight)
SELECT 8, id, 1.0 FROM symptoms WHERE name IN ('cough','chest_pain','fatigue','shortness_of_breath','fever','chills','sore_throat','runny_nose','headache','body_ache');

-- Asthma (id=9)
INSERT IGNORE INTO disease_symptoms (disease_id, symptom_id, weight)
SELECT 9, id, 1.0 FROM symptoms WHERE name IN ('shortness_of_breath','cough','chest_pain','wheezing','fatigue','night_sweats','anxiety','coughing_blood');

-- GERD (id=10)
INSERT IGNORE INTO disease_symptoms (disease_id, symptom_id, weight)
SELECT 10, id, 1.0 FROM symptoms WHERE name IN ('heartburn','chest_pain','nausea','vomiting','abdominal_pain','bloating','difficulty_swallowing','loss_of_appetite','sore_throat','cough');

-- Peptic Ulcer (id=11)
INSERT IGNORE INTO disease_symptoms (disease_id, symptom_id, weight)
SELECT 11, id, 1.0 FROM symptoms WHERE name IN ('abdominal_pain','heartburn','nausea','vomiting','bloating','loss_of_appetite','weight_loss','fatigue','dark_urine','chest_pain');

-- Appendicitis (id=12)
INSERT IGNORE INTO disease_symptoms (disease_id, symptom_id, weight)
SELECT 12, id, 1.0 FROM symptoms WHERE name IN ('abdominal_pain','nausea','vomiting','fever','loss_of_appetite','constipation','bloating','diarrhea','fatigue','chills');

-- Type 2 Diabetes (id=13)
INSERT IGNORE INTO disease_symptoms (disease_id, symptom_id, weight)
SELECT 13, id, 1.0 FROM symptoms WHERE name IN ('excessive_thirst','frequent_urination','blurred_vision','fatigue','slow_healing_wounds','numbness_tingling','increased_hunger','weight_loss','dry_skin','low_energy');

-- Hypertension (id=14)
INSERT IGNORE INTO disease_symptoms (disease_id, symptom_id, weight)
SELECT 14, id, 1.0 FROM symptoms WHERE name IN ('high_blood_pressure','headache','dizziness','shortness_of_breath','chest_pain','blurred_vision','fatigue','nausea','fluid_retention','cold_hands_feet');

-- Migraine (id=15)
INSERT IGNORE INTO disease_symptoms (disease_id, symptom_id, weight)
SELECT 15, id, 1.0 FROM symptoms WHERE name IN ('headache','nausea','vomiting','sensitivity_to_light','dizziness','fatigue','neck_stiffness','loss_of_appetite','blurred_vision','mood_swings');

-- Rheumatoid Arthritis (id=16)
INSERT IGNORE INTO disease_symptoms (disease_id, symptom_id, weight)
SELECT 16, id, 1.0 FROM symptoms WHERE name IN ('joint_pain','fatigue','fever','weight_loss','fluid_retention','muscle_pain','neck_stiffness','loss_of_appetite','sweating','low_energy');

-- Anemia (id=17)
INSERT IGNORE INTO disease_symptoms (disease_id, symptom_id, weight)
SELECT 17, id, 1.0 FROM symptoms WHERE name IN ('fatigue','dizziness','headache','cold_hands_feet','shortness_of_breath','chest_pain','low_energy','pale_skin','loss_of_appetite','hair_loss');

-- UTI (id=18)
INSERT IGNORE INTO disease_symptoms (disease_id, symptom_id, weight)
SELECT 18, id, 1.0 FROM symptoms WHERE name IN ('burning_urination','frequent_urination','pelvic_pain','blood_in_urine','fever','fatigue','nausea','abdominal_pain','dark_urine','loss_of_appetite');

-- Kidney Stones (id=19)
INSERT IGNORE INTO disease_symptoms (disease_id, symptom_id, weight)
SELECT 19, id, 1.0 FROM symptoms WHERE name IN ('abdominal_pain','blood_in_urine','nausea','vomiting','frequent_urination','burning_urination','fever','chills','pelvic_pain','back_pain');

-- Hepatitis B (id=20)
INSERT IGNORE INTO disease_symptoms (disease_id, symptom_id, weight)
SELECT 20, id, 1.0 FROM symptoms WHERE name IN ('skin_yellowing','dark_urine','fatigue','abdominal_pain','nausea','vomiting','fever','loss_of_appetite','joint_pain','weight_loss');

-- Chickenpox (id=21)
INSERT IGNORE INTO disease_symptoms (disease_id, symptom_id, weight)
SELECT 21, id, 1.0 FROM symptoms WHERE name IN ('skin_rash','fever','fatigue','loss_of_appetite','headache','skin_itching','muscle_pain','chills','sore_throat','runny_nose');

-- Measles (id=22)
INSERT IGNORE INTO disease_symptoms (disease_id, symptom_id, weight)
SELECT 22, id, 1.0 FROM symptoms WHERE name IN ('fever','skin_rash','cough','runny_nose','red_eyes','sensitivity_to_light','sore_throat','loss_of_appetite','fatigue','swollen_lymph_nodes');

-- Mumps (id=23)
INSERT IGNORE INTO disease_symptoms (disease_id, symptom_id, weight)
SELECT 23, id, 1.0 FROM symptoms WHERE name IN ('fever','headache','fatigue','muscle_pain','loss_of_appetite','swollen_lymph_nodes','difficulty_swallowing','neck_stiffness','nausea','chills');

-- Sinusitis (id=24)
INSERT IGNORE INTO disease_symptoms (disease_id, symptom_id, weight)
SELECT 24, id, 1.0 FROM symptoms WHERE name IN ('headache','nasal_congestion','runny_nose','fever','fatigue','sore_throat','loss_of_smell','cough','chills','neck_stiffness');

-- Tonsillitis (id=25)
INSERT IGNORE INTO disease_symptoms (disease_id, symptom_id, weight)
SELECT 25, id, 1.0 FROM symptoms WHERE name IN ('sore_throat','fever','difficulty_swallowing','swollen_lymph_nodes','headache','fatigue','loss_of_appetite','runny_nose','chills','bad_breath');

-- Conjunctivitis (id=26)
INSERT IGNORE INTO disease_symptoms (disease_id, symptom_id, weight)
SELECT 26, id, 1.0 FROM symptoms WHERE name IN ('eye_redness','red_eyes','skin_itching','runny_nose','fever','sore_throat','swollen_lymph_nodes','sensitivity_to_light','headache','fatigue');

-- Eczema (id=27)
INSERT IGNORE INTO disease_symptoms (disease_id, symptom_id, weight)
SELECT 27, id, 1.0 FROM symptoms WHERE name IN ('skin_rash','skin_itching','dry_skin','low_energy','sleep_disturbance','fatigue','skin_redness','inflammation','sensitivity_to_light','mood_swings');

-- Psoriasis (id=28)
INSERT IGNORE INTO disease_symptoms (disease_id, symptom_id, weight)
SELECT 28, id, 1.0 FROM symptoms WHERE name IN ('skin_rash','skin_itching','joint_pain','fatigue','dry_skin','hair_loss','mood_swings','low_energy','swollen_lymph_nodes','nail_changes');

-- Hypothyroidism (id=29)
INSERT IGNORE INTO disease_symptoms (disease_id, symptom_id, weight)
SELECT 29, id, 1.0 FROM symptoms WHERE name IN ('fatigue','weight_loss','cold_hands_feet','constipation','dry_skin','hair_loss','mood_swings','low_energy','slow_healing_wounds','blurred_vision');

-- Depression (id=30)
INSERT IGNORE INTO disease_symptoms (disease_id, symptom_id, weight)
SELECT 30, id, 1.0 FROM symptoms WHERE name IN ('fatigue','loss_of_appetite','weight_loss','mood_swings','low_energy','headache','sleep_disturbance','difficulty_swallowing','numbness_tingling','hair_loss');

-- ============================================================
-- HOSPITALS (15 hospitals)
-- ============================================================
INSERT IGNORE INTO hospitals (name, address, city, state, phone, email, specialties, emergency, rating) VALUES
('Apollo Hospitals', 'Jubilee Hills, Road No. 72', 'Hyderabad', 'Telangana', '+91-40-23607777', 'info@apollohyd.com', 'Cardiology,Neurology,Orthopedics,Oncology,Pulmonology', TRUE, 4.8),
('AIIMS New Delhi', 'Ansari Nagar, New Delhi', 'New Delhi', 'Delhi', '+91-11-26588500', 'director@aiims.ac.in', 'All Specialties,Research,Emergency Medicine', TRUE, 4.9),
('Fortis Hospital', 'Bannerghatta Road', 'Bangalore', 'Karnataka', '+91-80-66214444', 'info@fortisblr.com', 'Cardiology,Oncology,Transplant,Neurology', TRUE, 4.7),
('Max Super Speciality Hospital', 'Press Enclave Road, Saket', 'New Delhi', 'Delhi', '+91-11-26515050', 'info@maxhospitals.in', 'Orthopedics,Cardiology,Neurology,Endocrinology', TRUE, 4.6),
('Narayana Health', 'Bommasandra, Anekal Taluk', 'Bangalore', 'Karnataka', '+91-80-71222222', 'info@narayanahealth.org', 'Cardiology,Pediatrics,Oncology,Nephrology', TRUE, 4.7),
('Kokilaben Dhirubhai Ambani Hospital', '4 Bunglows, Andheri West', 'Mumbai', 'Maharashtra', '+91-22-42696969', 'info@kokilabenhospital.com', 'Oncology,Cardiology,Neurology,Transplant', TRUE, 4.8),
('Christian Medical College', 'Ida Scudder Road', 'Vellore', 'Tamil Nadu', '+91-416-2281000', 'info@cmcvellore.ac.in', 'All Specialties,Research,Infectious Disease', TRUE, 4.9),
('Tata Memorial Hospital', 'Dr. E Borges Road, Parel', 'Mumbai', 'Maharashtra', '+91-22-24177000', 'director@tmh.gov.in', 'Oncology,Radiation Therapy,Palliative Care', TRUE, 4.8),
('PGIMER', 'Sector 12, Chandigarh', 'Chandigarh', 'Punjab', '+91-172-2747585', 'director@pgimer.edu.in', 'All Specialties,Neurology,Transplant,Research', TRUE, 4.7),
('Manipal Hospitals', 'HAL Airport Road', 'Bangalore', 'Karnataka', '+91-80-25024444', 'info@manipalhospitals.com', 'Orthopedics,Cardiology,Neurology,Dermatology', TRUE, 4.6),
('Ruby Hall Clinic', '40 Sassoon Road', 'Pune', 'Maharashtra', '+91-20-66455555', 'info@rubyhall.com', 'Cardiology,Gastroenterology,Orthopedics,Pulmonology', TRUE, 4.5),
('Medanta - The Medicity', 'CH Baktawar Singh Road, Sector 38', 'Gurugram', 'Haryana', '+91-124-4141414', 'info@medanta.org', 'Cardiology,Neurology,Oncology,Transplant', TRUE, 4.8),
('Care Hospitals', 'Road No. 1, HITEC City', 'Hyderabad', 'Telangana', '+91-40-30418888', 'info@carehospitals.com', 'Cardiology,Nephrology,Neurology,Orthopedics', TRUE, 4.4),
('NIMHANS', 'Hosur Road, Lakkasandra', 'Bangalore', 'Karnataka', '+91-80-46110007', 'director@nimhans.ac.in', 'Psychiatry,Neurology,Psychology,Research', FALSE, 4.7),
('Global Hospital', '35, Dr. E. Borges Road, Parel', 'Mumbai', 'Maharashtra', '+91-22-67670101', 'info@globalhospitalsmumbai.com', 'Transplant,Gastroenterology,Hepatology,Cardiology', TRUE, 4.5),
('Apollo Hospitals', '21, Greams Lane, Off Greams Road', 'Chennai', 'Tamil Nadu', '+91-44-28293333', 'info@apollochennai.com', 'Cardiology,Neurology,Oncology,Orthopedics', TRUE, 4.8),
('MGM Healthcare', '72, Nelson Manickam Road, Aminjikarai', 'Chennai', 'Tamil Nadu', '+91-44-45242424', 'info@mgmhealthcare.in', 'Multi-Specialty,Cardiology,Transplant', TRUE, 4.7),
('MIOT International', '4/112, Mount Poonamallee Road, Manapakkam', 'Chennai', 'Tamil Nadu', '+91-44-45021000', 'info@miotinternational.com', 'Orthopedics,Cardiology,Nephrology,Multi-Specialty', TRUE, 4.6),
('SIMS Hospital', 'No.1, Jawaharlal Nehru Salai, Vadapalani', 'Chennai', 'Tamil Nadu', '+91-44-20002001', 'info@simshospitals.com', 'Multi-Specialty,Cardiology,Gastroenterology,Oncology', TRUE, 4.7),
('Kauvery Hospital', 'No. 199, Luz Church Rd, Alwarpet', 'Chennai', 'Tamil Nadu', '+91-44-40006000', 'info@kauveryhospital.com', 'Cardiology,Geriatrics,Multi-Specialty', TRUE, 4.6),
('The Madras Medical Mission', '4-A, Dr. J. Jayalalithaa Nagar, Mogappair', 'Chennai', 'Tamil Nadu', '+91-44-26565961', 'info@mmm.org.in', 'Cardiology,Oncology,Transplant', TRUE, 4.7);
