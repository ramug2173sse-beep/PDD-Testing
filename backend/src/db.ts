import { Pool } from 'pg'
import bcrypt from 'bcrypt'

const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: Number(process.env.POSTGRES_PORT || 5432),
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'postgres',
  database: process.env.POSTGRES_DB || 'gsmat_db',
  max: 10,
  idleTimeoutMillis: 10000,
})

let useMock = false

pool.on('error', (err) => {
  console.error('Unexpected error on idle Postgres client', err)
})

// Stateful Mock Data Store
const dbStore: {
  roles: any[]
  users: any[]
  hospitals: any[]
  doctors: any[]
  diseases: any[]
  symptoms: any[]
  disease_symptoms: any[]
  predictions: any[]
  appointments: any[]
  medical_reports: any[]
  notifications: any[]
  audit_logs: any[]
} = {
  roles: [
    { id: 1, name: 'admin' },
    { id: 2, name: 'doctor' },
    { id: 3, name: 'patient' }
  ],
  users: [
    {
      id: 1,
      full_name: 'System Administrator',
      email: 'admin@gsmat.com',
      phone: '+919999999999',
      password_hash: '$2b$10$v7qqP8TMGelQub1YxPH19eOpCJ8k5QrDKNzmBplQNzv2GwkPB.5ju', // password123
      age: 35,
      gender: 'male',
      address: 'Admin Center, Metropolis',
      role_id: 1,
      is_active: true,
      created_at: new Date()
    },
    {
      id: 2,
      full_name: 'John Doe',
      email: 'john@gmail.com',
      phone: '+918888888888',
      password_hash: '$2b$10$v7qqP8TMGelQub1YxPH19eOpCJ8k5QrDKNzmBplQNzv2GwkPB.5ju', // password123
      age: 28,
      gender: 'male',
      address: '45 Park Street, Chennai',
      role_id: 3,
      is_active: true,
      created_at: new Date()
    }
  ],
  hospitals: [
    {
      id: 1,
      name: 'Chennai City Hospital',
      address: '12 Greams Road',
      city: 'Chennai',
      state: 'Tamil Nadu',
      phone: '+914428290200',
      email: 'contact@chennaicityhosp.org',
      specialties: 'General Medicine, Cardiology, Neurology, Pulmonology, Gastroenterology',
      total_beds: 200,
      available_beds: 45,
      icu_beds: 30,
      available_icu: 8,
      ventilators: 15,
      available_ventilators: 4,
      emergency: true,
      rating: 4.6,
      latitude: 13.0602,
      longitude: 80.2496,
      created_at: new Date()
    },
    {
      id: 2,
      name: 'Apollo Health Center',
      address: '21 Shanthi Colony',
      city: 'Chennai',
      state: 'Tamil Nadu',
      phone: '+914426260000',
      email: 'care@apollohealth.in',
      specialties: 'General Medicine, Pediatrics, Neurology, Infectious Disease',
      total_beds: 150,
      available_beds: 12,
      icu_beds: 20,
      available_icu: 2,
      ventilators: 10,
      available_ventilators: 0,
      emergency: true,
      rating: 4.4,
      latitude: 13.0827,
      longitude: 80.2707,
      created_at: new Date()
    },
    {
      id: 3,
      name: 'Metro Emergency Clinic',
      address: '56 Lattice Bridge Rd',
      city: 'Chennai',
      state: 'Tamil Nadu',
      phone: '+914424910000',
      email: 'info@metroemerg.com',
      specialties: 'General Medicine, Emergency, Pulmonology',
      total_beds: 50,
      available_beds: 0,
      icu_beds: 5,
      available_icu: 0,
      ventilators: 3,
      available_ventilators: 0,
      emergency: true,
      rating: 3.9,
      latitude: 12.9830,
      longitude: 80.2501,
      created_at: new Date()
    },
    {
      id: 4,
      name: 'Fortis General Hospital',
      address: '102 Arcade Road',
      city: 'Metropolis',
      state: 'State',
      phone: '+1234567890',
      email: 'admin@fortishosp.com',
      specialties: 'Cardiology, Gastroenterology, Neurology, General Medicine',
      total_beds: 120,
      available_beds: 24,
      icu_beds: 15,
      available_icu: 6,
      ventilators: 8,
      available_ventilators: 3,
      emergency: false,
      rating: 4.2,
      latitude: 12.9716,
      longitude: 80.2412,
      created_at: new Date()
    }
  ],
  doctors: [
    { id: 1, hospital_id: 1, full_name: 'Dr. Aris Ramug', specialization: 'Neurology', phone: '+919876543210', email: 'aris@chennaicityhosp.org', consultation_fee: 600.00, rating: 4.8 },
    { id: 2, hospital_id: 1, full_name: 'Dr. Sarah Connor', specialization: 'Pulmonology', phone: '+919876543211', email: 'sarah@chennaicityhosp.org', consultation_fee: 500.00, rating: 4.5 },
    { id: 3, hospital_id: 2, full_name: 'Dr. Ramesh Kumar', specialization: 'General Medicine', phone: '+919876543212', email: 'ramesh@apollohealth.in', consultation_fee: 300.00, rating: 4.2 },
    { id: 4, hospital_id: 2, full_name: 'Dr. Priya Sharma', specialization: 'Gastroenterology', phone: '+919876543213', email: 'priya@apollohealth.in', consultation_fee: 700.00, rating: 4.7 },
    { id: 5, hospital_id: 3, full_name: 'Dr. Daniel Jackson', specialization: 'Infectious Disease', phone: '+919876543214', email: 'daniel@metroemerg.com', consultation_fee: 800.00, rating: 4.9 },
    { id: 6, hospital_id: 4, full_name: 'Dr. John Watson', specialization: 'General Medicine', phone: '+919876543215', email: 'watson@fortishosp.com', consultation_fee: 350.00, rating: 4.3 }
  ],
  diseases: [
    {
      id: 1,
      name: 'Common Cold',
      description: 'A viral infectious disease of the upper respiratory tract that primarily affects the nose, throat, sinuses, and larynx.',
      category: 'Infectious',
      severity: 'mild',
      specialist_required: 'General Practitioner',
      is_contagious: true,
      causes: 'Highly contagious rhinovirus infections spreading through airborne droplets or direct contact.',
      symptoms_list: 'Sore throat, runny nose, nasal congestion, sneezing, mild cough, low-grade fever.',
      diagnosis_methods: 'Clinical evaluation, physical examination of the nasal passage and throat.',
      treatment_procedures: 'Symptomatic therapy, hydration, bed rest.',
      required_medications: 'Acetaminophen or Ibuprofen (for fever/aches), Decongestants, Cough suppressants, Saline nasal sprays.',
      lifestyle_recommendations: 'Get plenty of sleep, keep room warm and humidified, drink warm fluids, gargle with warm salt water.',
      prevention_techniques: 'Wash hands frequently with soap, avoid touching eyes/nose with unwashed hands, avoid close contact with infected individuals.',
      recovery_process: 'Self-limiting infection, typical resolution is within 7 to 10 days.',
      success_rate: '99%',
      treatment_duration: '7 - 10 Days',
      treatment_cost: 'INR 500 - 1500',
      recovery_probability: '99%',
      home_care: 'Rest in a well-ventilated room, stay warm, monitor temperature.',
      diet_recommendations: 'Increase fluid intake (water, herbal teas, broths), eat vitamin C-rich fruits, avoid cold and oily foods.',
      exercise_recommendations: 'Avoid heavy exercises; gentle stretching or light walking is fine if symptoms are above the neck.',
      faqs: [
        { question: 'Is common cold the same as the flu?', answer: 'No, the common cold is caused by different viruses than influenza, and symptoms are generally much milder.' },
        { question: 'Should I take antibiotics?', answer: 'No, antibiotics kill bacteria, not viruses. Taking them for a cold will not help and can cause side effects.' }
      ],
      created_at: new Date()
    },
    {
      id: 2,
      name: 'Influenza',
      description: 'A highly contagious viral infection that attacks the respiratory system, including the nose, throat, and lungs.',
      category: 'Infectious',
      severity: 'moderate',
      specialist_required: 'General Practitioner / Pulmonologist',
      is_contagious: true,
      causes: 'Influenza viruses (Type A and B) spreading through aerosolized droplets from coughing or sneezing.',
      symptoms_list: 'Sudden onset of high fever, chills, dry cough, severe muscle or body aches, fatigue, headache.',
      diagnosis_methods: 'Rapid Influenza Diagnostic Tests (RIDT), PCR nasal swab, clinical assessment of acute symptoms.',
      treatment_procedures: 'Antiviral therapy (when started early), bed rest, supportive care.',
      required_medications: 'Oseltamivir (Tamiflu) or Zanamivir (Relenza) antivirals, Paracetamol/Ibuprofen for body aches and high fever.',
      lifestyle_recommendations: 'Absolute bed rest, high fluid intake, keep room humidified to relieve respiratory congestion.',
      prevention_techniques: 'Annual influenza vaccination, frequent hand sanitization, covering coughs/sneezes, isolating when sick.',
      recovery_process: 'Fever usually subsides in 3-5 days, while cough and fatigue can persist for 14-21 days.',
      success_rate: '98%',
      treatment_duration: '1 - 2 Weeks',
      treatment_cost: 'INR 1500 - 4000',
      recovery_probability: '98%',
      home_care: 'Strict isolation from vulnerable family members, monitor blood oxygen levels and temperature regularly.',
      diet_recommendations: 'Nutrient-rich warm soups, warm water, foods rich in zinc and antioxidants. Avoid dairy if it increases phlegm.',
      exercise_recommendations: 'Strictly rest. Resume physical activity only after complete resolution of fatigue and muscle soreness.',
      faqs: [
        { question: 'When should I see a doctor for the flu?', answer: 'If you experience shortness of breath, chest pain, persistent high fever, or confusion, seek immediate medical attention.' },
        { question: 'How effective is the flu vaccine?', answer: 'The vaccine reduces the risk of flu illness by 40% to 60% and significantly prevents severe complications and hospitalization.' }
      ],
      created_at: new Date()
    },
    {
      id: 3,
      name: 'Migraine',
      description: 'A neurological condition characterized by intense, debilitating headaches, often accompanied by sensory disturbances.',
      category: 'Neurological',
      severity: 'moderate',
      specialist_required: 'Neurologist',
      is_contagious: false,
      causes: 'Temporary changes in the brain chemical pathways, trigeminal nerve activation, and genetic susceptibility.',
      symptoms_list: 'Throbbing headache (often on one side), nausea, vomiting, extreme sensitivity to light (photophobia) and sound, visual aura (flashing lights).',
      diagnosis_methods: 'Neurological examination, medical history mapping, MRI/CT scans to rule out other organic causes of headaches.',
      treatment_procedures: 'Acute abortive treatment (to stop an active attack), preventive therapy, trigger management.',
      required_medications: 'Triptans (Sumatriptan, Zolmitriptan), NSAIDs (Naproxen, Ibuprofen), Antiemetics (for nausea), Preventive beta-blockers or CGRP inhibitors.',
      lifestyle_recommendations: 'Maintain a regular sleep schedule, avoid dietary triggers (caffeine, aged cheese, alcohol), practice stress-reduction techniques.',
      prevention_techniques: 'Keep a migraine diary to identify and avoid specific triggers, stay hydrated, maintain consistent meal times.',
      recovery_process: 'An individual attack lasts between 4 hours and 72 hours. Relief is achieved with target abortive medication.',
      success_rate: '85% (management success)',
      treatment_duration: 'Varies (4 - 72 Hours per attack)',
      treatment_cost: 'INR 1000 - 3000 per month',
      recovery_probability: '95% (long-term control)',
      home_care: 'Rest in a dark, quiet room with a cool cloth on the forehead. Minimize sensory stimulation.',
      diet_recommendations: 'Eat regular balanced meals. Stay hydrated. Limit processed foods, artificial sweeteners, and MSG.',
      exercise_recommendations: 'Regular moderate aerobic exercise (e.g., swimming, cycling) on non-headache days helps reduce frequency.',
      faqs: [
        { question: 'What is a migraine aura?', answer: 'An aura is a collection of temporary neurological symptoms (like blind spots, zig-zag lines, or tingling in arms) that occur before the headache starts.' },
        { question: 'Does caffeine help migraines?', answer: 'Caffeine can help stop a migraine in its early stages (which is why it is in some headache medications), but overuse can cause rebound headaches.' }
      ],
      created_at: new Date()
    },
    {
      id: 4,
      name: 'Gastritis',
      description: 'An inflammation, irritation, or erosion of the protective lining of the stomach.',
      category: 'Gastrointestinal',
      severity: 'moderate',
      specialist_required: 'Gastroenterologist',
      is_contagious: false,
      causes: 'Helicobacter pylori bacterial infection, long-term use of NSAID pain relievers, excessive alcohol consumption, or stress.',
      symptoms_list: 'Burning pain or ache in the upper abdomen (indigestion), nausea, vomiting, feeling of fullness after eating.',
      diagnosis_methods: 'Upper endoscopy with biopsy, H. pylori breath test, stool test, blood tests for anemia.',
      treatment_procedures: 'Acid suppression therapy, antibiotic regimens (if bacterial), avoidance of mucosal irritants.',
      required_medications: 'Proton Pump Inhibitors (Omeprazole, Pantoprazole), H2 Blockers (Famotidine), Antacids, Antibiotics (Clarithromycin & Amoxicillin for H. pylori).',
      lifestyle_recommendations: 'Eat smaller and more frequent meals, avoid spicy, acidic, fried, and fatty foods. Eliminate alcohol and tobacco.',
      prevention_techniques: 'Avoid frequent use of pain relievers (like aspirin/ibuprofen), maintain food hygiene to prevent H. pylori, manage stress.',
      recovery_process: 'Acute gastritis resolves in a few days after eliminating the cause; chronic gastritis takes weeks or months of therapy.',
      success_rate: '95%',
      treatment_duration: '3 - 14 Days (Acute)',
      treatment_cost: 'INR 1000 - 5000',
      recovery_probability: '95%',
      home_care: 'Avoid eating within 2 hours of sleeping, elevate head while sleeping, monitor for signs of blood in vomit or stool.',
      diet_recommendations: 'Bland diet (oatmeal, rice, bananas, applesauce, boiled chicken), drink chamomile tea, avoid spicy and acidic citrus fruits.',
      exercise_recommendations: 'Light exercises like walking help digestion; avoid vigorous abdominal exercises which can trigger acid reflux.',
      faqs: [
        { question: 'Can stress cause gastritis?', answer: 'Yes, severe physiological stress (from major surgery, injury, or severe infection) can cause acute stress-induced gastritis.' },
        { question: 'Are bananas good for gastritis?', answer: 'Yes, bananas are low-acid, gentle on the stomach, and help coat the inflamed stomach lining.' }
      ],
      created_at: new Date()
    },
    {
      id: 5,
      name: 'Pneumonia',
      description: 'An infection that inflames the air sacs (alveoli) in one or both lungs, which may fill with fluid or pus.',
      category: 'Pulmonary',
      severity: 'severe',
      specialist_required: 'Pulmonologist',
      is_contagious: true,
      causes: 'Bacterial infection (Streptococcus pneumoniae), viral infections (like influenza or RSV), or fungal pathogens.',
      symptoms_list: 'Cough with green/yellow phlegm, high fever, shaking chills, shortness of breath, sharp chest pain during breathing/coughing.',
      diagnosis_methods: 'Chest X-ray, blood test, sputum culture, pulse oximetry, CT scan of chest for severe cases.',
      treatment_procedures: 'Targeted antibiotic or antiviral therapy, oxygen support (if hypoxic), airway clearance support.',
      required_medications: 'Broad-spectrum Antibiotics (Azithromycin, Levofloxacin, Amoxicillin-Clavulanate), Antipyretics, Mucolytics.',
      lifestyle_recommendations: 'Complete rest, use a humidifier, practice deep breathing exercises, avoid exposure to smoke/dust.',
      prevention_techniques: 'Pneumococcal vaccination, annual flu vaccination, avoiding smoking (which damages lung defenses), hand hygiene.',
      recovery_process: 'Recovery can take 2 to 4 weeks. Fatigue and mild cough can persist for up to a month or more.',
      success_rate: '90% (highly dependent on age)',
      treatment_duration: '2 - 4 Weeks',
      treatment_cost: 'INR 5000 - 25000',
      recovery_probability: '90%',
      home_care: 'Monitor oxygen saturation oximetry readings, practice deep breathing and coughing exercises, use incentive spirometer.',
      diet_recommendations: 'Stay well hydrated to help thin mucus, eat high-protein meals to aid tissue repair, supplement with Vitamin C and D.',
      exercise_recommendations: 'Complete rest during acute phase. Start slow walks only after clear chest and doctor permission.',
      faqs: [
        { question: 'Is pneumonia contagious?', answer: 'The bacteria or viruses causing pneumonia can be contagious, but the condition itself develops depending on an individual\'s immune system.' },
        { question: 'What is walking pneumonia?', answer: 'It is a non-medical term for a milder form of pneumonia, typically caused by Mycoplasma pneumoniae, where hospital bed rest is not required.' }
      ],
      created_at: new Date()
    }
  ],
  symptoms: [],
  disease_symptoms: [],
  predictions: [],
  appointments: [],
  medical_reports: [],
  notifications: [
    { id: 1, user_id: 2, message: 'Welcome to General Smart Medical Assistance System! Please update your health profile.', category: 'health', is_read: false, created_at: new Date() }
  ],
  audit_logs: []
}

// Test Connection
pool.connect()
  .then(() => {
    console.log('[DB] PostgreSQL connected successfully.')
    useMock = false
  })
  .catch((err) => {
    console.warn('[DB] PostgreSQL connection failed. Falling back to Stateful In-Memory Mock Database.')
    useMock = true
  })

export async function query(text: string, params: any[] = []) {
  if (!useMock) {
    const start = Date.now()
    const res = await pool.query(text, params)
    const duration = Date.now() - start
    console.log('[Postgres Query] executed', { text, duration, rows: res.rowCount })
    return res
  }

  // In-Memory stateful simulation
  const cleanedText = text.replace(/\s+/g, ' ').trim()
  console.log('[Mock DB Query]', cleanedText, 'Params:', params)

  let rows: any[] = []
  let rowCount = 0

  // 1. Roles
  if (cleanedText.startsWith('SELECT id FROM roles WHERE name = $1')) {
    const role = dbStore.roles.find(r => r.name === params[0])
    rows = role ? [role] : []
  }
  else if (cleanedText.startsWith('SELECT name FROM roles WHERE id = $1')) {
    const role = dbStore.roles.find(r => r.id === Number(params[0]))
    rows = role ? [role] : []
  }
  // 2. Auth checking & User detail lookup
  else if (cleanedText.startsWith('SELECT id FROM users WHERE email = $1 OR phone = $2')) {
    const user = dbStore.users.find(u => u.email === params[0] || u.phone === params[1])
    rows = user ? [user] : []
  }
  else if (cleanedText.startsWith('SELECT * FROM users WHERE email = $1 OR phone = $1')) {
    const user = dbStore.users.find(u => u.email === params[0] || u.phone === params[0])
    rows = user ? [user] : []
  }
  else if (cleanedText.startsWith('SELECT id, full_name, email, phone, role_id, is_active FROM users WHERE id = $1')) {
    const user = dbStore.users.find(u => u.id === Number(params[0]))
    rows = user ? [user] : []
  }
  else if (cleanedText.startsWith('SELECT u.id, u.full_name, u.email, u.phone, u.age, u.gender, u.address, u.is_active, u.created_at, ro.name as role FROM users u LEFT JOIN roles ro ON u.role_id = ro.id WHERE u.id = $1')) {
    const user = dbStore.users.find(u => u.id === Number(params[0]))
    if (user) {
      const role = dbStore.roles.find(r => r.id === user.role_id)
      rows = [{ ...user, role: role?.name || 'patient' }]
    }
  }
  // 3. Insert User
  else if (cleanedText.startsWith('INSERT INTO users (full_name, email, phone, password_hash, age, gender, address, role_id) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING')) {
    const newId = dbStore.users.length + 1
    const newUser = {
      id: newId,
      full_name: params[0],
      email: params[1],
      phone: params[2],
      password_hash: params[3],
      age: params[4] || null,
      gender: params[5] || null,
      address: params[6] || null,
      role_id: params[7] || 3, // patient
      is_active: true,
      created_at: new Date()
    }
    dbStore.users.push(newUser)
    rows = [newUser]
  }
  // 4. Counts
  else if (cleanedText.startsWith('SELECT COUNT(*)::int AS cnt FROM predictions WHERE user_id = $1')) {
    const count = dbStore.predictions.filter(p => p.user_id === Number(params[0])).length
    rows = [{ cnt: count }]
  }
  else if (cleanedText.startsWith('SELECT COUNT(*)::int AS cnt FROM appointments WHERE user_id = $1 AND appointment_at >= now()')) {
    const count = dbStore.appointments.filter(a => a.user_id === Number(params[0])).length
    rows = [{ cnt: count }]
  }
  // 5. Predictions
  else if (cleanedText.startsWith('SELECT * FROM predictions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50')) {
    rows = dbStore.predictions.filter(p => p.user_id === Number(params[0])).sort((a,b) => b.created_at.getTime() - a.created_at.getTime())
  }
  else if (cleanedText.startsWith('INSERT INTO predictions (user_id, predicted_disease_id, predicted_disease_name, confidence, symptoms_provided) VALUES ($1,$2,$3,$4,$5) RETURNING id, created_at') || cleanedText.indexOf('INSERT INTO predictions') === 0) {
    const newId = dbStore.predictions.length + 1
    const pDisease = dbStore.diseases.find(d => d.name === params[2])
    const newPred = {
      id: newId,
      user_id: params[0] ? Number(params[0]) : null,
      predicted_disease_id: pDisease?.id || null,
      predicted_disease_name: params[2],
      confidence: params[3],
      symptoms_provided: params[4],
      created_at: new Date()
    }
    dbStore.predictions.push(newPred)
    rows = [newPred]
  }
  // 6. Appointments
  else if (cleanedText.startsWith('SELECT a.*, h.name as hospital_name, d.full_name as doctor_name FROM appointments a LEFT JOIN hospitals h ON a.hospital_id=h.id LEFT JOIN doctors d ON a.doctor_id=d.id WHERE a.user_id=$1')) {
    const appts = dbStore.appointments.filter(a => a.user_id === Number(params[0]))
    rows = appts.map(a => {
      const h = dbStore.hospitals.find(h => h.id === a.hospital_id)
      const d = dbStore.doctors.find(d => d.id === a.doctor_id)
      return {
        ...a,
        hospital_name: h?.name || 'Hospital',
        doctor_name: d?.full_name || 'General Doctor'
      }
    })
  }
  else if (cleanedText.startsWith('INSERT INTO appointments (user_id, hospital_id, doctor_id, appointment_at, notes) VALUES ($1,$2,$3,$4,$5) RETURNING id, appointment_at, status')) {
    const newId = dbStore.appointments.length + 1
    const newAppt = {
      id: newId,
      user_id: Number(params[0]),
      hospital_id: Number(params[1]),
      doctor_id: params[2] ? Number(params[2]) : null,
      appointment_at: new Date(params[3]),
      notes: params[4] || null,
      status: 'scheduled',
      created_at: new Date()
    }
    dbStore.appointments.push(newAppt)
    rows = [newAppt]
  }
  // 7. Bed availability / Hospitals
  else if (cleanedText.startsWith('SELECT * FROM hospitals WHERE 1=1')) {
    let list = [...dbStore.hospitals]
    if (params.length > 0) {
      for (const param of params) {
        if (typeof param === 'string' && param.startsWith('%') && param.endsWith('%')) {
          const val = param.slice(1, -1).toLowerCase()
          list = list.filter(h => 
            (h.city && h.city.toLowerCase().includes(val)) || 
            (h.specialties && h.specialties.toLowerCase().includes(val)) || 
            (h.name && h.name.toLowerCase().includes(val))
          )
        }
      }
    }
    rows = list.sort((a,b) => b.rating - a.rating)
  }
  else if (cleanedText.startsWith('SELECT id, name, city, total_beds, available_beds, icu_beds, available_icu, ventilators, available_ventilators FROM hospitals ORDER BY name')) {
    rows = dbStore.hospitals.sort((a,b) => a.name.localeCompare(b.name))
  }
  else if (cleanedText.startsWith('SELECT id, name, address, city, phone, total_beds, available_beds, icu_beds, available_icu, ventilators, available_ventilators FROM hospitals ORDER BY name LIMIT 500')) {
    rows = dbStore.hospitals.sort((a,b) => a.name.localeCompare(b.name))
  }
  else if (cleanedText.startsWith('UPDATE hospitals SET total_beds=$1, available_beds=$2, icu_beds=$3, available_icu=$4, ventilators=$5, available_ventilators=$6 WHERE id=$7 RETURNING')) {
    const id = Number(params[6])
    const hIdx = dbStore.hospitals.findIndex(h => h.id === id)
    if (hIdx !== -1) {
      dbStore.hospitals[hIdx].total_beds = params[0]
      dbStore.hospitals[hIdx].available_beds = params[1]
      dbStore.hospitals[hIdx].icu_beds = params[2]
      dbStore.hospitals[hIdx].available_icu = params[3]
      dbStore.hospitals[hIdx].ventilators = params[4]
      dbStore.hospitals[hIdx].available_ventilators = params[5]
      rows = [dbStore.hospitals[hIdx]]
    }
  }
  else if (cleanedText.startsWith('INSERT INTO hospitals (name, address, city, phone) VALUES ($1,$2,$3,$4) RETURNING')) {
    const newId = dbStore.hospitals.length + 1
    const newHosp = {
      id: newId,
      name: params[0],
      address: params[1] || null,
      city: params[2] || null,
      phone: params[3] || null,
      specialties: 'General Medicine',
      total_beds: 100,
      available_beds: 10,
      icu_beds: 10,
      available_icu: 2,
      ventilators: 5,
      available_ventilators: 1,
      emergency: true,
      rating: 4.0,
      created_at: new Date()
    }
    dbStore.hospitals.push(newHosp)
    rows = [newHosp]
  }
  else if (cleanedText.startsWith('UPDATE hospitals SET name=$1, address=$2, city=$3, phone=$4 WHERE id=$5 RETURNING')) {
    const id = Number(params[4])
    const hIdx = dbStore.hospitals.findIndex(h => h.id === id)
    if (hIdx !== -1) {
      dbStore.hospitals[hIdx].name = params[0]
      dbStore.hospitals[hIdx].address = params[1] || null
      dbStore.hospitals[hIdx].city = params[2] || null
      dbStore.hospitals[hIdx].phone = params[3] || null
      rows = [dbStore.hospitals[hIdx]]
    }
  }
  else if (cleanedText.startsWith('DELETE FROM hospitals WHERE id=$1 RETURNING id')) {
    const id = Number(params[0])
    const hIdx = dbStore.hospitals.findIndex(h => h.id === id)
    if (hIdx !== -1) {
      const deleted = dbStore.hospitals[hIdx]
      dbStore.hospitals.splice(hIdx, 1)
      rows = [deleted]
    }
  }
  else if (cleanedText.startsWith('INSERT INTO bed_availability (hospital_id,')) {
    rows = [{ id: 1 }]
  }
  // 8. Admin statistics
  else if (cleanedText.startsWith('SELECT COUNT(*)::int AS cnt FROM users')) {
    rows = [{ cnt: dbStore.users.length }]
  }
  else if (cleanedText.startsWith('SELECT COUNT(*)::int AS cnt FROM hospitals')) {
    rows = [{ cnt: dbStore.hospitals.length }]
  }
  else if (cleanedText.startsWith('SELECT COUNT(*)::int AS cnt FROM predictions')) {
    rows = [{ cnt: dbStore.predictions.length }]
  }
  else if (cleanedText.startsWith('SELECT COUNT(*)::int AS cnt FROM appointments')) {
    rows = [{ cnt: dbStore.appointments.length }]
  }
  else if (cleanedText.startsWith('SELECT AVG(CASE WHEN total_beds > 0 THEN (total_beds - available_beds)::float / total_beds ELSE 0 END)::numeric(5,2) AS avg_utilization FROM hospitals')) {
    const utils = dbStore.hospitals.map(h => h.total_beds > 0 ? (h.total_beds - h.available_beds) / h.total_beds : 0)
    const avg = utils.length > 0 ? utils.reduce((a,b)=>a+b, 0) / utils.length : 0
    rows = [{ avg_utilization: (avg * 100).toFixed(2) }]
  }
  else if (cleanedText.startsWith('SELECT id, name, city, total_beds, available_beds, icu_beds, available_icu, ventilators, available_ventilators, CASE WHEN total_beds > 0 THEN available_beds::float / total_beds ELSE 0 END AS available_ratio FROM hospitals ORDER BY available_ratio ASC')) {
    const sorted = [...dbStore.hospitals].map(h => ({
      ...h,
      available_ratio: h.total_beds > 0 ? h.available_beds / h.total_beds : 0
    })).sort((a,b)=> a.available_ratio - b.available_ratio)
    rows = sorted.slice(0, 5)
  }
  else if (cleanedText.startsWith('SELECT to_char(created_at::date, \'YYYY-MM-DD\') AS date, COUNT(*)::int AS count FROM predictions')) {
    const dates: Record<string, number> = {}
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const key = d.toISOString().split('T')[0]
      dates[key] = 0
    }
    dbStore.predictions.forEach(p => {
      const key = p.created_at.toISOString().split('T')[0]
      if (dates[key] !== undefined) dates[key] += 1
    })
    rows = Object.keys(dates).map(k => ({ date: k, count: dates[k] }))
  }
  else if (cleanedText.startsWith('SELECT to_char(created_at::date, \'YYYY-MM-DD\') AS date, COUNT(*)::int AS count FROM appointments')) {
    const dates: Record<string, number> = {}
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const key = d.toISOString().split('T')[0]
      dates[key] = 0
    }
    dbStore.appointments.forEach(a => {
      const key = a.created_at.toISOString().split('T')[0]
      if (dates[key] !== undefined) dates[key] += 1
    })
    rows = Object.keys(dates).map(k => ({ date: k, count: dates[k] }))
  }
  else if (cleanedText.startsWith('SELECT id, full_name, email, is_active, created_at FROM users ORDER BY created_at DESC')) {
    rows = dbStore.users.map(u => ({ id: u.id, full_name: u.full_name, email: u.email, is_active: u.is_active, created_at: u.created_at })).sort((a,b)=>b.created_at.getTime() - a.created_at.getTime())
  }
  else if (cleanedText.startsWith('UPDATE users SET is_active=$1 WHERE id=$2 RETURNING id, full_name, email, is_active')) {
    const id = Number(params[1])
    const uIdx = dbStore.users.findIndex(u => u.id === id)
    if (uIdx !== -1) {
      dbStore.users[uIdx].is_active = params[0]
      rows = [dbStore.users[uIdx]]
    }
  }
  else if (cleanedText.startsWith('SELECT p.*, u.email as user_email FROM predictions p LEFT JOIN users u ON p.user_id=u.id ORDER BY p.created_at DESC')) {
    rows = dbStore.predictions.map(p => {
      const u = dbStore.users.find(u => u.id === p.user_id)
      return { ...p, user_email: u?.email || 'guest@gsmat.com' }
    }).sort((a,b)=>b.created_at.getTime() - a.created_at.getTime())
  }
  // 9. Notifications (New)
  else if (cleanedText.startsWith('SELECT * FROM notifications WHERE user_id = $1')) {
    rows = dbStore.notifications.filter(n => n.user_id === Number(params[0])).sort((a,b)=>b.created_at.getTime() - a.created_at.getTime())
  }
  else if (cleanedText.startsWith('UPDATE notifications SET is_read = TRUE WHERE id = $1')) {
    const nid = Number(params[0])
    const nIdx = dbStore.notifications.findIndex(n => n.id === nid)
    if (nIdx !== -1) {
      dbStore.notifications[nIdx].is_read = true
      rows = [dbStore.notifications[nIdx]]
    }
  }
  else if (cleanedText.startsWith('INSERT INTO notifications (user_id, message, category) VALUES ($1,$2,$3) RETURNING *')) {
    const newId = dbStore.notifications.length + 1
    const newNotif = {
      id: newId,
      user_id: Number(params[0]),
      message: params[1],
      category: params[2],
      is_read: false,
      created_at: new Date()
    }
    dbStore.notifications.push(newNotif)
    rows = [newNotif]
  }
  // 10. Medical Reports (New)
  else if (cleanedText.startsWith('SELECT * FROM medical_reports WHERE user_id = $1')) {
    rows = dbStore.medical_reports.filter(r => r.user_id === Number(params[0])).sort((a,b)=>b.uploaded_at.getTime() - a.uploaded_at.getTime())
  }
  else if (cleanedText.startsWith('INSERT INTO medical_reports (user_id, filename, file_path, mime_type, summary) VALUES ($1,$2,$3,$4,$5) RETURNING *')) {
    const newId = dbStore.medical_reports.length + 1
    const newRep = {
      id: newId,
      user_id: Number(params[0]),
      filename: params[1],
      file_path: params[2],
      mime_type: params[3],
      summary: params[4],
      uploaded_at: new Date()
    }
    dbStore.medical_reports.push(newRep)
    rows = [newRep]
  }
  else if (cleanedText.startsWith('SELECT * FROM medical_reports WHERE id = $1')) {
    const rep = dbStore.medical_reports.find(r => r.id === Number(params[0]))
    rows = rep ? [rep] : []
  }
  else if (cleanedText.startsWith('DELETE FROM medical_reports WHERE id = $1 RETURNING id')) {
    const rid = Number(params[0])
    const rIdx = dbStore.medical_reports.findIndex(r => r.id === rid)
    if (rIdx !== -1) {
      const del = dbStore.medical_reports[rIdx]
      dbStore.medical_reports.splice(rIdx, 1)
      rows = [del]
    }
  }
  // 11. Diseases (New)
  else if (cleanedText.startsWith('SELECT * FROM diseases ORDER BY name') || cleanedText.startsWith('SELECT id, name, description, category, severity, specialist_required, is_contagious FROM diseases')) {
    rows = dbStore.diseases.sort((a,b) => a.name.localeCompare(b.name))
  }
  else if (cleanedText.startsWith('SELECT * FROM diseases WHERE id = $1') || cleanedText.startsWith('SELECT * FROM diseases WHERE id=$1')) {
    const dis = dbStore.diseases.find(d => d.id === Number(params[0]))
    rows = dis ? [dis] : []
  }
  // 12. Doctors (New)
  else if (cleanedText.startsWith('SELECT * FROM doctors WHERE hospital_id = $1') || cleanedText.startsWith('SELECT * FROM doctors WHERE hospital_id=$1')) {
    rows = dbStore.doctors.filter(d => d.hospital_id === Number(params[0]))
  }
  else if (cleanedText.startsWith('SELECT * FROM doctors')) {
    rows = dbStore.doctors
  }
  // 13. Audit logs (New)
  else if (cleanedText.startsWith('INSERT INTO audit_logs')) {
    const newId = dbStore.audit_logs.length + 1
    const log = {
      id: newId,
      user_id: params[0] || null,
      action: params[1],
      details: params[2] || {},
      ip_address: params[3] || '127.0.0.1',
      created_at: new Date()
    }
    dbStore.audit_logs.push(log)
    rows = [log]
  }

  rowCount = rows.length
  return { rows, rowCount }
}

export default pool
