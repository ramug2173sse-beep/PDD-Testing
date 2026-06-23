-- GSMAT PostgreSQL schema
-- Run: psql -U <postgres_user> -d <db_name> -f backend/db/schema.sql

-- Roles
CREATE TABLE IF NOT EXISTS roles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Users
CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(30) UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  age INT,
  gender VARCHAR(20),
  address TEXT,
  role_id INT REFERENCES roles(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Hospitals
CREATE TABLE IF NOT EXISTS hospitals (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  phone VARCHAR(50),
  email VARCHAR(255),
  specialties TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  rating NUMERIC(2,1) DEFAULT 0,
  total_beds INT DEFAULT 0,
  available_beds INT DEFAULT 0,
  icu_beds INT DEFAULT 0,
  available_icu INT DEFAULT 0,
  ventilators INT DEFAULT 0,
  available_ventilators INT DEFAULT 0,
  emergency BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_hospitals_city ON hospitals(city);

-- Doctors
CREATE TABLE IF NOT EXISTS doctors (
  id BIGSERIAL PRIMARY KEY,
  hospital_id BIGINT REFERENCES hospitals(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  specialization VARCHAR(255),
  phone VARCHAR(50),
  email VARCHAR(255),
  consultation_fee NUMERIC(10,2),
  rating NUMERIC(2,1) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Diseases
CREATE TABLE IF NOT EXISTS diseases (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  category VARCHAR(100),
  severity VARCHAR(50),
  specialist_required VARCHAR(255),
  is_contagious BOOLEAN DEFAULT FALSE,
  causes TEXT,
  symptoms_list TEXT,
  diagnosis_methods TEXT,
  treatment_procedures TEXT,
  required_medications TEXT,
  lifestyle_recommendations TEXT,
  prevention_techniques TEXT,
  recovery_process TEXT,
  success_rate VARCHAR(50),
  treatment_duration VARCHAR(100),
  treatment_cost VARCHAR(100),
  recovery_probability VARCHAR(50),
  home_care TEXT,
  diet_recommendations TEXT,
  exercise_recommendations TEXT,
  faqs JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Symptoms
CREATE TABLE IF NOT EXISTS symptoms (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  category VARCHAR(100),
  severity_level VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Disease <-> Symptom mapping
CREATE TABLE IF NOT EXISTS disease_symptoms (
  disease_id BIGINT REFERENCES diseases(id) ON DELETE CASCADE,
  symptom_id BIGINT REFERENCES symptoms(id) ON DELETE CASCADE,
  PRIMARY KEY (disease_id, symptom_id)
);

-- Predictions
CREATE TABLE IF NOT EXISTS predictions (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  predicted_disease_id BIGINT REFERENCES diseases(id) ON DELETE SET NULL,
  predicted_disease_name VARCHAR(255),
  confidence NUMERIC(5,2),
  risk_level VARCHAR(50),
  severity_score NUMERIC(5,2),
  recommended_action TEXT,
  suggested_specialist VARCHAR(255),
  symptoms_provided TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Appointments
CREATE TABLE IF NOT EXISTS appointments (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  hospital_id BIGINT REFERENCES hospitals(id) ON DELETE CASCADE,
  doctor_id BIGINT REFERENCES doctors(id) ON DELETE SET NULL,
  appointment_at TIMESTAMPTZ NOT NULL,
  status VARCHAR(50) DEFAULT 'scheduled',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Bed availability history (time series)
CREATE TABLE IF NOT EXISTS bed_availability (
  id BIGSERIAL PRIMARY KEY,
  hospital_id BIGINT REFERENCES hospitals(id) ON DELETE CASCADE,
  recorded_at TIMESTAMPTZ DEFAULT now(),
  total_beds INT,
  available_beds INT,
  icu_beds INT,
  available_icu INT,
  ventilators INT,
  available_ventilators INT
);

-- Medical reports
CREATE TABLE IF NOT EXISTS medical_reports (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  filename VARCHAR(255) NOT NULL,
  file_path TEXT NOT NULL,
  mime_type VARCHAR(100),
  summary TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT now()
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  category VARCHAR(50),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Audit logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(255) NOT NULL,
  details JSONB,
  ip_address VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT now()
);
