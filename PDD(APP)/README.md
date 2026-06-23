# SMAT – Smart Medical Assistant

**SMAT** is a comprehensive full-stack medical assistant application designed to provide users with preliminary health insights and medical resource management. It leverages Machine Learning to predict potential diseases based on user-reported symptoms and helps in finding relevant hospitals and specializations.

---

## 🚀 Key Features

- **Disease Prediction**: AI-powered prediction module using a Random Forest Classifier to identify potential ailments from a curated list of symptoms.
- **User Management**: Secure authentication system (Signup, Login, Logout) with personalized profiles and medical history tracking.
- **Hospital Directory**: Search and view hospitals with details on departments, specializations, and contact information.
- **Medical History**: Users can keep a record of their predicted diagnoses and health concerns.
- **Admin Dashboard**: Specialized interface for managing diseases, symptoms, hospitals, and users.
- **Responsive UI**: Clean, modern, and mobile-friendly interface built with vanilla CSS and JavaScript.

---

## 🛠️ Tech Stack

- **Backend**: Python / Flask
- **Database**: MySQL (using `mysql-connector-python`)
- **Machine Learning**: Scikit-Learn (Random Forest), Pandas, NumPy, Joblib
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Security**: Flask-Bcrypt for password hashing, Flask-Login for session management

---

## ⚙️ Installation & Setup

Follow these steps to set up the project locally:

### 1. Clone the Repository
```bash
git clone <repository-url>
cd SMAT
```

### 2. Create a Virtual Environment (Recommended)
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Configure Environment Variables
Create a `.env` file in the root directory and add your MySQL credentials:
```env
MYSQL_HOST=localhost
MYSQL_USER=your_username
MYSQL_PASSWORD=your_password
MYSQL_DB=smat_db
SECRET_KEY=your_secret_key
```

### 5. Initialize the Database
Ensure your MySQL server is running, then run the initialization script:
```bash
python init_db.py
```
*Note: This will create the database schema and seed it with initial data.*

### 6. Train the ML Model
Before running the app, train the disease prediction model:
```bash
python ml_model/train.py
```

---

## 🏃 Running the Application

To start the Flask development server:
```bash
python run.py
```
The application will be available at `http://localhost:5000`.

---

## 📂 Project Structure

- `app/`: Core application logic (Blueprints, routes, models, static files, templates).
- `database/`: SQL scripts for schema and data seeding.
- `ml_model/`: Training scripts and serialized model files.
- `init_db.py`: Database setup script.
- `run.py`: Application entry point.
- `requirements.txt`: Python package dependencies.
- `.env`: Environment configuration (Database & Secrets).

---

## 📄 License
This project is licensed under the MIT License.
