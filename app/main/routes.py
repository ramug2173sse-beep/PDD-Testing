from flask import render_template, redirect, url_for, flash, request, jsonify
from flask_login import login_required, current_user
from . import main
from app.db import query_db, execute_db
from app.ml.predictor import predict_disease
import json

@main.route('/')
def index():
    diseases_count = query_db('SELECT COUNT(*) as cnt FROM diseases', one=True)
    hospitals_count = query_db('SELECT COUNT(*) as cnt FROM hospitals', one=True)
    symptoms_count = query_db('SELECT COUNT(*) as cnt FROM symptoms', one=True)
    recent_diseases = query_db(
        'SELECT name, category, severity FROM diseases ORDER BY RAND() LIMIT 6'
    )
    return render_template('main/index.html',
                           diseases_count=diseases_count['cnt'] if diseases_count else 30,
                           hospitals_count=hospitals_count['cnt'] if hospitals_count else 15,
                           symptoms_count=symptoms_count['cnt'] if symptoms_count else 55,
                           recent_diseases=recent_diseases)

@main.route('/dashboard')
@login_required
def dashboard():
    recent_predictions = query_db(
        'SELECT * FROM predictions WHERE user_id = %s ORDER BY created_at DESC LIMIT 5',
        (current_user.id,)
    )
    history_count = query_db(
        'SELECT COUNT(*) as cnt FROM medical_history WHERE user_id = %s',
        (current_user.id,), one=True
    )
    predictions_count = query_db(
        'SELECT COUNT(*) as cnt FROM predictions WHERE user_id = %s',
        (current_user.id,), one=True
    )
    return render_template('main/dashboard.html',
                           recent_predictions=recent_predictions,
                           history_count=history_count['cnt'] if history_count else 0,
                           predictions_count=predictions_count['cnt'] if predictions_count else 0)

@main.route('/checker')
@login_required
def checker():
    symptoms = query_db(
        'SELECT id, name, description, category, severity_level FROM symptoms ORDER BY category, name'
    )
    # Group by category
    categories = {}
    for s in symptoms:
        cat = s['category']
        if cat not in categories:
            categories[cat] = []
        categories[cat].append(s)
    return render_template('main/checker.html', categories=categories, symptoms=symptoms)

@main.route('/predict', methods=['POST'])
@login_required
def predict():
    data = request.get_json() or {}
    selected_symptoms = data.get('symptoms', [])

    if len(selected_symptoms) < 3:
        return jsonify({'success': False, 'error': 'Please select at least 3 symptoms.'}), 400

    try:
        result = predict_disease(selected_symptoms)
        if not result:
            return jsonify({'success': False, 'error': 'Prediction failed. Try again.'}), 500

        # Save prediction to DB
        symptoms_str = ', '.join(selected_symptoms)
        top = result[0]
        second = result[1] if len(result) > 1 else {}
        third = result[2] if len(result) > 2 else {}

        # Get disease id
        disease_row = query_db('SELECT id FROM diseases WHERE name = %s', (top['disease'],), one=True)
        disease_id = disease_row['id'] if disease_row else None

        pred_id = execute_db(
            '''INSERT INTO predictions (user_id, predicted_disease_id, predicted_disease_name,
               confidence_score, symptoms_provided, second_prediction, second_confidence,
               third_prediction, third_confidence)
               VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)''',
            (current_user.id, disease_id, top['disease'], top.get('confidence', 0),
             symptoms_str, second.get('disease', ''), second.get('confidence', 0),
             third.get('disease', ''), third.get('confidence', 0))
        )

        return jsonify({'success': True, 'prediction_id': pred_id})
    except Exception as e:
        print(f"Prediction error: {e}")
        return jsonify({'success': False, 'error': 'An error occurred during prediction.'}), 500

@main.route('/results/<int:pred_id>')
@login_required
def results(pred_id):
    prediction = query_db(
        'SELECT * FROM predictions WHERE id = %s AND user_id = %s',
        (pred_id, current_user.id), one=True
    )
    if not prediction:
        flash('Prediction not found.', 'warning')
        return redirect(url_for('main.checker'))

    disease = query_db(
        'SELECT * FROM diseases WHERE name = %s',
        (prediction['predicted_disease_name'],), one=True
    ) if prediction['predicted_disease_name'] else None

    # Get disease symptoms
    disease_symptoms = []
    if disease:
        disease_symptoms = query_db(
            '''SELECT s.name, s.description, s.severity_level FROM symptoms s
               JOIN disease_symptoms ds ON s.id = ds.symptom_id
               WHERE ds.disease_id = %s''',
            (disease['id'],)
        )

    # Recommend hospitals by specialty
    hospitals = []
    if disease and disease.get('specialist_required'):
        specialist = disease['specialist_required']
        hospitals = query_db(
            "SELECT * FROM hospitals WHERE specialties LIKE %s ORDER BY rating DESC LIMIT 5",
            (f'%{specialist.split()[0]}%',)
        )
        if not hospitals:
            hospitals = query_db(
                'SELECT * FROM hospitals ORDER BY rating DESC LIMIT 5'
            )
    else:
        hospitals = query_db('SELECT * FROM hospitals ORDER BY rating DESC LIMIT 5')

    user_symptoms = [s.strip() for s in (prediction['symptoms_provided'] or '').split(',')]

    return render_template('main/results.html',
                           prediction=prediction,
                           disease=disease,
                           disease_symptoms=disease_symptoms,
                           hospitals=hospitals,
                           user_symptoms=user_symptoms)

@main.route('/history')
@login_required
def history():
    page = request.args.get('page', 1, type=int)
    per_page = 10
    offset = (page - 1) * per_page

    predictions = query_db(
        'SELECT * FROM predictions WHERE user_id = %s ORDER BY created_at DESC LIMIT %s OFFSET %s',
        (current_user.id, per_page, offset)
    )
    total = query_db(
        'SELECT COUNT(*) as cnt FROM predictions WHERE user_id = %s',
        (current_user.id,), one=True
    )
    total_count = total['cnt'] if total else 0
    total_pages = (total_count + per_page - 1) // per_page

    medical_records = query_db(
        'SELECT * FROM medical_history WHERE user_id = %s ORDER BY created_at DESC',
        (current_user.id,)
    )
    return render_template('main/history.html',
                           predictions=predictions,
                           medical_records=medical_records,
                           page=page,
                           total_pages=total_pages,
                           total_count=total_count)

@main.route('/history/add', methods=['POST'])
@login_required
def add_history():
    prediction_id = request.form.get('prediction_id', '')
    disease_name = request.form.get('disease_name', '').strip()
    diagnosis_date = request.form.get('diagnosis_date', '')
    doctor_visited = request.form.get('doctor_visited', '').strip()
    hospital_visited = request.form.get('hospital_visited', '').strip()
    medications = request.form.get('medications', '').strip()
    recovery_status = request.form.get('recovery_status', 'recovering')
    notes = request.form.get('notes', '').strip()

    try:
        execute_db(
            '''INSERT INTO medical_history (user_id, prediction_id, disease_name, diagnosis_date,
               doctor_visited, hospital_visited, medications, recovery_status, notes)
               VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)''',
            (current_user.id, prediction_id or None, disease_name,
             diagnosis_date or None, doctor_visited or None, hospital_visited or None,
             medications or None, recovery_status, notes or None)
        )
        flash('Medical record added successfully!', 'success')
    except Exception as e:
        flash('Failed to add record. Please try again.', 'danger')
    return redirect(url_for('main.history'))

@main.route('/history/delete/<int:record_id>', methods=['POST'])
@login_required
def delete_history(record_id):
    execute_db(
        'DELETE FROM medical_history WHERE id = %s AND user_id = %s',
        (record_id, current_user.id)
    )
    flash('Record deleted.', 'info')
    return redirect(url_for('main.history'))

@main.route('/hospitals')
@login_required
def hospitals():
    city = request.args.get('city', '')
    specialty = request.args.get('specialty', '')
    emergency = request.args.get('emergency', '')
    
    query = 'SELECT * FROM hospitals WHERE 1=1'
    args = []
    if city:
        query += ' AND city LIKE %s'
        args.append(f'%{city}%')
    if specialty:
        query += ' AND specialties LIKE %s'
        args.append(f'%{specialty}%')
    if emergency:
        query += ' AND emergency = 1'
    query += ' ORDER BY rating DESC'

    hospital_list = query_db(query, args)
    cities = query_db('SELECT DISTINCT city FROM hospitals ORDER BY city')
    return render_template('main/hospitals.html',
                           hospitals=hospital_list, cities=cities,
                           city=city, specialty=specialty, emergency=emergency)

@main.route('/diseases')
def diseases():
    category = request.args.get('category', '')
    severity = request.args.get('severity', '')
    
    query = 'SELECT * FROM diseases WHERE 1=1'
    args = []
    if category:
        query += ' AND category = %s'
        args.append(category)
    if severity:
        query += ' AND severity = %s'
        args.append(severity)
    query += ' ORDER BY name'
    
    disease_list = query_db(query, args)
    categories = query_db('SELECT DISTINCT category FROM diseases ORDER BY category')
    return render_template('main/diseases.html',
                           diseases=disease_list, categories=categories,
                           category=category, severity=severity)

@main.route('/diseases/<int:disease_id>')
def disease_detail(disease_id):
    disease = query_db('SELECT * FROM diseases WHERE id = %s', (disease_id,), one=True)
    if not disease:
        flash('Disease not found.', 'warning')
        return redirect(url_for('main.diseases'))
    
    symptoms = query_db(
        '''SELECT s.name, s.description, s.severity_level, ds.weight
           FROM symptoms s JOIN disease_symptoms ds ON s.id = ds.symptom_id
           WHERE ds.disease_id = %s ORDER BY ds.weight DESC''',
        (disease_id,)
    )
    return render_template('main/disease_detail.html', disease=disease, symptoms=symptoms)
