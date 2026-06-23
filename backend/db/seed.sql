-- GSMAT seed data (comprehensive)

-- Roles
INSERT INTO roles (name) VALUES ('admin') ON CONFLICT (name) DO NOTHING;
INSERT INTO roles (name) VALUES ('doctor') ON CONFLICT (name) DO NOTHING;
INSERT INTO roles (name) VALUES ('patient') ON CONFLICT (name) DO NOTHING;

-- Clean existing if needed, but safe INSERTs
-- Default password: password123 (bcrypt hash: $2b$10$mC37qgU1L64U72eH2kI4vO3/kPqH3eH.O1g2D5v7R9uE8wK4yB3sC)
-- We will insert user accounts
INSERT INTO users (full_name, email, phone, password_hash, age, gender, address, role_id)
VALUES 
('System Administrator', 'admin@gsmat.com', '+919999999999', '$2b$10$mC37qgU1L64U72eH2kI4vO3/kPqH3eH.O1g2D5v7R9uE8wK4yB3sC', 35, 'male', 'Admin Center, Metropolis', 1)
ON CONFLICT (email) DO NOTHING;

INSERT INTO users (full_name, email, phone, password_hash, age, gender, address, role_id)
VALUES 
('John Doe', 'john@gmail.com', '+918888888888', '$2b$10$mC37qgU1L64U72eH2kI4vO3/kPqH3eH.O1g2D5v7R9uE8wK4yB3sC', 28, 'male', '45 Park Street, Chennai', 3)
ON CONFLICT (email) DO NOTHING;

-- Sample hospitals
INSERT INTO hospitals (name, address, city, state, phone, email, specialties, total_beds, available_beds, icu_beds, available_icu, ventilators, available_ventilators, emergency, rating, latitude, longitude)
VALUES
('Chennai City Hospital', '12 Greams Road', 'Chennai', 'Tamil Nadu', '+914428290200', 'contact@chennaicityhosp.org', 'General Medicine, Cardiology, Neurology, Pulmonology, Gastroenterology', 200, 45, 30, 8, 15, 4, true, 4.6, 13.0602, 80.2496),
('Apollo Health Center', '21 Shanthi Colony', 'Chennai', 'Tamil Nadu', '+914426260000', 'care@apollohealth.in', 'General Medicine, Pediatrics, Neurology, Infectious Disease', 150, 12, 20, 2, 10, 0, true, 4.4, 13.0827, 80.2707),
('Metro Emergency Clinic', '56 Lattice Bridge Rd', 'Chennai', 'Tamil Nadu', '+914424910000', 'info@metroemerg.com', 'General Medicine, Emergency, Pulmonology', 50, 0, 5, 0, 3, 0, true, 3.9, 12.9830, 80.2501),
('Fortis General Hospital', '102 Arcade Road', 'Metropolis', 'State', '+1234567890', 'admin@fortishosp.com', 'Cardiology, Gastroenterology, Neurology, General Medicine', 120, 24, 15, 6, 8, 3, false, 4.2, 12.9716, 80.2412)
ON CONFLICT DO NOTHING;

-- Doctors
INSERT INTO doctors (hospital_id, full_name, specialization, phone, email, consultation_fee, rating)
VALUES
(1, 'Dr. Aris Ramug', 'Neurology', '+919876543210', 'aris@chennaicityhosp.org', 600.00, 4.8),
(1, 'Dr. Sarah Connor', 'Pulmonology', '+919876543211', 'sarah@chennaicityhosp.org', 500.00, 4.5),
(2, 'Dr. Ramesh Kumar', 'General Medicine', '+919876543212', 'ramesh@apollohealth.in', 300.00, 4.2),
(2, 'Dr. Priya Sharma', 'Gastroenterology', '+919876543213', 'priya@apollohealth.in', 700.00, 4.7),
(3, 'Dr. Daniel Jackson', 'Infectious Disease', '+919876543214', 'daniel@metroemerg.com', 800.00, 4.9),
(4, 'Dr. John Watson', 'General Medicine', '+919876543215', 'watson@fortishosp.com', 350.00, 4.3)
ON CONFLICT DO NOTHING;

-- Diseases
INSERT INTO diseases (name, description, category, severity, specialist_required, is_contagious, causes, symptoms_list, diagnosis_methods, treatment_procedures, required_medications, lifestyle_recommendations, prevention_techniques, recovery_process, success_rate, treatment_duration, treatment_cost, recovery_probability, home_care, diet_recommendations, exercise_recommendations, faqs)
VALUES 
('Common Cold', 'A viral infectious disease of the upper respiratory tract that primarily affects the nose, throat, sinuses, and larynx.', 'Infectious', 'mild', 'General Practitioner', true,
 'Highly contagious rhinovirus infections spreading through airborne droplets or direct contact.',
 'Sore throat, runny nose, nasal congestion, sneezing, mild cough, low-grade fever.',
 'Clinical evaluation, physical examination of the nasal passage and throat.',
 'Symptomatic therapy, hydration, bed rest.',
 'Acetaminophen or Ibuprofen (for fever/aches), Decongestants, Cough suppressants, Saline nasal sprays.',
 'Get plenty of sleep, keep room warm and humidified, drink warm fluids, gargle with warm salt water.',
 'Wash hands frequently with soap, avoid touching eyes/nose with unwashed hands, avoid close contact with infected individuals.',
 'Self-limiting infection, typical resolution is within 7 to 10 days.',
 '99%', '7 - 10 Days', 'INR 500 - 1500', '99%',
 'Rest in a well-ventilated room, stay warm, monitor temperature.',
 'Increase fluid intake (water, herbal teas, broths), eat vitamin C-rich fruits, avoid cold and oily foods.',
 'Avoid heavy exercises; gentle stretching or light walking is fine if symptoms are above the neck.',
 '[{"question":"Is common cold the same as the flu?","answer":"No, the common cold is caused by different viruses than influenza, and symptoms are generally much milder."},{"question":"Should I take antibiotics?","answer":"No, antibiotics kill bacteria, not viruses. Taking them for a cold will not help and can cause side effects."}]'::jsonb),

('Influenza', 'A highly contagious viral infection that attacks the respiratory system, including the nose, throat, and lungs.', 'Infectious', 'moderate', 'General Practitioner / Pulmonologist', true,
 'Influenza viruses (Type A and B) spreading through aerosolized droplets from coughing or sneezing.',
 'Sudden onset of high fever, chills, dry cough, severe muscle or body aches, fatigue, headache.',
 'Rapid Influenza Diagnostic Tests (RIDT), PCR nasal swab, clinical assessment of acute symptoms.',
 'Antiviral therapy (when started early), bed rest, supportive care.',
 'Oseltamivir (Tamiflu) or Zanamivir (Relenza) antivirals, Paracetamol/Ibuprofen for body aches and high fever.',
 'Absolute bed rest, high fluid intake, keep room humidified to relieve respiratory congestion.',
 'Annual influenza vaccination, frequent hand sanitization, covering coughs/sneezes, isolating when sick.',
 'Fever usually subsides in 3-5 days, while cough and fatigue can persist for 14-21 days.',
 '98%', '1 - 2 Weeks', 'INR 1500 - 4000', '98%',
 'Strict isolation from vulnerable family members, monitor blood oxygen levels and temperature regularly.',
 'Nutrient-rich warm soups, warm water, foods rich in zinc and antioxidants. Avoid dairy if it increases phlegm.',
 'Strictly rest. Resume physical activity only after complete resolution of fatigue and muscle soreness.',
 '[{"question":"When should I see a doctor for the flu?","answer":"If you experience shortness of breath, chest pain, persistent high fever, or confusion, seek immediate medical attention."},{"question":"How effective is the flu vaccine?","answer":"The vaccine reduces the risk of flu illness by 40% to 60% and significantly prevents severe complications and hospitalization."}]'::jsonb),

('Migraine', 'A neurological condition characterized by intense, debilitating headaches, often accompanied by sensory disturbances.', 'Neurological', 'moderate', 'Neurologist', false,
 'Temporary changes in the brain chemical pathways, trigeminal nerve activation, and genetic susceptibility.',
 'Throbbing headache (often on one side), nausea, vomiting, extreme sensitivity to light (photophobia) and sound, visual aura (flashing lights).',
 'Neurological examination, medical history mapping, MRI/CT scans to rule out other organic causes of headaches.',
 'Acute abortive treatment (to stop an active attack), preventive therapy, trigger management.',
 'Triptans (Sumatriptan, Zolmitriptan), NSAIDs (Naproxen, Ibuprofen), Antiemetics (for nausea), Preventive beta-blockers or CGRP inhibitors.',
 'Maintain a regular sleep schedule, avoid dietary triggers (caffeine, aged cheese, alcohol), practice stress-reduction techniques.',
 'Keep a migraine diary to identify and avoid specific triggers, stay hydrated, maintain consistent meal times.',
 'An individual attack lasts between 4 hours and 72 hours. Relief is achieved with target abortive medication.',
 '85% (management success)', 'Varies (4 - 72 Hours per attack)', 'INR 1000 - 3000 per month', '95% (long-term control)',
 'Rest in a dark, quiet room with a cool cloth on the forehead. Minimize sensory stimulation.',
 'Eat regular balanced meals. Stay hydrated. Limit processed foods, artificial sweeteners, and MSG.',
 'Regular moderate aerobic exercise (e.g., swimming, cycling) on non-headache days helps reduce frequency.',
 '[{"question":"What is a migraine aura?","answer":"An aura is a collection of temporary neurological symptoms (like blind spots, zig-zag lines, or tingling in arms) that occur before the headache starts."},{"question":"Does caffeine help migraines?","answer":"Caffeine can help stop a migraine in its early stages (which is why it is in some headache medications), but overuse can cause rebound headaches."}]'::jsonb),

('Gastritis', 'An inflammation, irritation, or erosion of the protective lining of the stomach.', 'Gastrointestinal', 'moderate', 'Gastroenterologist', false,
 'Helicobacter pylori bacterial infection, long-term use of NSAID pain relievers, excessive alcohol consumption, or stress.',
 'Burning pain or ache in the upper abdomen (indigestion), nausea, vomiting, feeling of fullness after eating.',
 'Upper endoscopy with biopsy, H. pylori breath test, stool test, blood tests for anemia.',
 'Acid suppression therapy, antibiotic regimens (if bacterial), avoidance of mucosal irritants.',
 'Proton Pump Inhibitors (Omeprazole, Pantoprazole), H2 Blockers (Famotidine), Antacids, Antibiotics (Clarithromycin & Amoxicillin for H. pylori).',
 'Eat smaller and more frequent meals, avoid spicy, acidic, fried, and fatty foods. Eliminate alcohol and tobacco.',
 'Avoid frequent use of pain relievers (like aspirin/ibuprofen), maintain food hygiene to prevent H. pylori, manage stress.',
 'Acute gastritis resolves in a few days after eliminating the cause; chronic gastritis takes weeks or months of therapy.',
 '95%', '3 - 14 Days (Acute)', 'INR 1000 - 5000', '95%',
 'Avoid eating within 2 hours of sleeping, elevate head while sleeping, monitor for signs of blood in vomit or stool.',
 'Bland diet (oatmeal, rice, bananas, applesauce, boiled chicken), drink chamomile tea, avoid spicy and acidic citrus fruits.',
 'Light exercises like walking help digestion; avoid vigorous abdominal exercises which can trigger acid reflux.',
 '[{"question":"Can stress cause gastritis?","answer":"Yes, severe physiological stress (from major surgery, injury, or severe infection) can cause acute stress-induced gastritis."},{"question":"Are bananas good for gastritis?","answer":"Yes, bananas are low-acid, gentle on the stomach, and help coat the inflamed stomach lining."}]'::jsonb),

('Pneumonia', 'An infection that inflames the air sacs (alveoli) in one or both lungs, which may fill with fluid or pus.', 'Pulmonary', 'severe', 'Pulmonologist', true,
 'Bacterial infection (Streptococcus pneumoniae), viral infections (like influenza or RSV), or fungal pathogens.',
 'Cough with green/yellow phlegm, high fever, shaking chills, shortness of breath, sharp chest pain during breathing/coughing.',
 'Chest X-ray, blood test, sputum culture, pulse oximetry, CT scan of chest for severe cases.',
 'Targeted antibiotic or antiviral therapy, oxygen support (if hypoxic), airway clearance support.',
 'Broad-spectrum Antibiotics (Azithromycin, Levofloxacin, Amoxicillin-Clavulanate), Antipyretics, Mucolytics.',
 'Complete rest, use a humidifier, practice deep breathing exercises, avoid exposure to smoke/dust.',
 'Pneumococcal vaccination, annual flu vaccination, avoiding smoking (which damages lung defenses), hand hygiene.',
 'Recovery can take 2 to 4 weeks. Fatigue and mild cough can persist for up to a month or more.',
 '90% (highly dependent on age)', '2 - 4 Weeks', 'INR 5000 - 25000', '90%',
 'Monitor oxygen saturation oximetry readings, practice deep breathing and coughing exercises, use incentive spirometer.',
 'Stay well hydrated to help thin mucus, eat high-protein meals to aid tissue repair, supplement with Vitamin C and D.',
 'Complete rest during acute phase. Start slow walks only after clear chest and doctor permission.',
 '[{"question":"Is pneumonia contagious?","answer":"The bacteria or viruses causing pneumonia can be contagious, but the condition itself develops depending on an individual''s immune system."},{"question":"What is walking pneumonia?","answer":"It is a non-medical term for a milder form of pneumonia, typically caused by Mycoplasma pneumoniae, where hospital bed rest is not required."}]'::jsonb)
ON CONFLICT (name) DO NOTHING;

-- Symptoms
INSERT INTO symptoms (name, description, category, severity_level) VALUES
('Fever', 'Elevated body temperature above 98.6F (37C)', 'General', 'mild'),
('Cough', 'A sudden, repetitive reflex to clear the breathing passage', 'Respiratory', 'mild'),
('Sore Throat', 'Pain, scratchiness or irritation of the throat', 'Respiratory', 'mild'),
('Sneezing', 'Involuntary convulsive expulsion of air from nose', 'Respiratory', 'mild'),
('Runny Nose', 'Excess nasal drainage or congestion', 'Respiratory', 'mild'),
('Chills', 'Sensation of cold accompanied by shivering', 'General', 'mild'),
('Body Ache', 'Diffuse muscle pain and fatigue throughout the body', 'General', 'moderate'),
('Fatigue', 'Extreme tiredness resulting from mental/physical exertion', 'General', 'moderate'),
('Headache', 'Pain in any region of the head', 'Neurological', 'moderate'),
('Nausea', 'Sensation of unease and discomfort with urge to vomit', 'Gastrointestinal', 'moderate'),
('Sensitivity to light', 'Photophobia where light causes eye discomfort', 'Neurological', 'moderate'),
('Aura', 'Sensory disturbances like flashing lights before headache', 'Neurological', 'moderate'),
('Stomach Pain', 'Pain or discomfort in the abdominal region', 'Gastrointestinal', 'moderate'),
('Vomiting', 'Forcible expulsion of stomach contents through mouth', 'Gastrointestinal', 'severe'),
('Abdominal Bloating', 'Sensation of full, tight or swollen abdomen', 'Gastrointestinal', 'mild'),
('Shortness of Breath', 'Difficulty breathing or feeling breathless', 'Respiratory', 'severe'),
('Chest Pain', 'Discomfort or pain in the chest area', 'Respiratory', 'severe'),
('Dry Cough', 'Cough that does not produce phlegm or mucus', 'Respiratory', 'mild'),
('Loss of Taste', 'Partial or complete loss of taste (ageusia)', 'Neurological', 'moderate')
ON CONFLICT (name) DO NOTHING;

-- Disease-Symptom mappings (matching keywords in predictor.ts heuristics)
-- 1. Common Cold mappings
INSERT INTO disease_symptoms (disease_id, symptom_id)
SELECT d.id, s.id FROM diseases d, symptoms s 
WHERE d.name = 'Common Cold' AND s.name IN ('Cough', 'Sore Throat', 'Sneezing', 'Runny Nose');

-- 2. Influenza mappings
INSERT INTO disease_symptoms (disease_id, symptom_id)
SELECT d.id, s.id FROM diseases d, symptoms s 
WHERE d.name = 'Influenza' AND s.name IN ('Fever', 'Cough', 'Chills', 'Body Ache', 'Fatigue');

-- 3. Migraine mappings
INSERT INTO disease_symptoms (disease_id, symptom_id)
SELECT d.id, s.id FROM diseases d, symptoms s 
WHERE d.name = 'Migraine' AND s.name IN ('Headache', 'Nausea', 'Sensitivity to light', 'Aura');

-- 4. Gastritis mappings
INSERT INTO disease_symptoms (disease_id, symptom_id)
SELECT d.id, s.id FROM diseases d, symptoms s 
WHERE d.name = 'Gastritis' AND s.name IN ('Stomach Pain', 'Nausea', 'Vomiting', 'Abdominal Bloating');

-- 5. Pneumonia mappings
INSERT INTO disease_symptoms (disease_id, symptom_id)
SELECT d.id, s.id FROM diseases d, symptoms s 
WHERE d.name = 'Pneumonia' AND s.name IN ('Fever', 'Cough', 'Shortness of Breath', 'Chest Pain');
