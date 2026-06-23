from flask import render_template, redirect, url_for, flash, request, jsonify
from flask_login import login_required, current_user
from functools import wraps
from . import admin
from app.db import query_db, execute_db
from app import bcrypt

def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.is_authenticated or not current_user.is_admin:
            flash('Admin access required.', 'danger')
            return redirect(url_for('main.index'))
        return f(*args, **kwargs)
    return decorated_function

# ============ DASHBOARD ============
@admin.route('/dashboard')
@login_required
@admin_required
def dashboard():
    stats = {
        'users': query_db('SELECT COUNT(*) as cnt FROM users WHERE is_admin = 0', one=True)['cnt'],
        'diseases': query_db('SELECT COUNT(*) as cnt FROM diseases', one=True)['cnt'],
        'symptoms': query_db('SELECT COUNT(*) as cnt FROM symptoms', one=True)['cnt'],
        'hospitals': query_db('SELECT COUNT(*) as cnt FROM hospitals', one=True)['cnt'],
        'predictions': query_db('SELECT COUNT(*) as cnt FROM predictions', one=True)['cnt'],
        'history': query_db('SELECT COUNT(*) as cnt FROM medical_history', one=True)['cnt'],
    }
    recent_predictions = query_db(
        '''SELECT p.*, u.username, u.email FROM predictions p
           JOIN users u ON p.user_id = u.id
           ORDER BY p.created_at DESC LIMIT 10'''
    )
    top_diseases = query_db(
        '''SELECT predicted_disease_name, COUNT(*) as count FROM predictions
           WHERE predicted_disease_name != ""
           GROUP BY predicted_disease_name ORDER BY count DESC LIMIT 5'''
    )
    recent_users = query_db(
        'SELECT id, username, email, created_at, is_active FROM users ORDER BY created_at DESC LIMIT 5'
    )
    return render_template('admin/dashboard.html', stats=stats,
                           recent_predictions=recent_predictions,
                           top_diseases=top_diseases,
                           recent_users=recent_users)

# ============ USERS ============
@admin.route('/users')
@login_required
@admin_required
def users():
    users_list = query_db('SELECT * FROM users ORDER BY created_at DESC')
    return render_template('admin/users.html', users=users_list)

@admin.route('/users/toggle/<int:user_id>', methods=['POST'])
@login_required
@admin_required
def toggle_user(user_id):
    user = query_db('SELECT is_active, is_admin FROM users WHERE id = %s', (user_id,), one=True)
    if not user:
        flash('User not found.', 'danger')
    elif user['is_admin']:
        flash('Cannot deactivate admin accounts.', 'warning')
    else:
        new_status = 0 if user['is_active'] else 1
        execute_db('UPDATE users SET is_active = %s WHERE id = %s', (new_status, user_id))
        flash(f'User {"activated" if new_status else "deactivated"} successfully.', 'success')
    return redirect(url_for('admin.users'))

@admin.route('/users/delete/<int:user_id>', methods=['POST'])
@login_required
@admin_required
def delete_user(user_id):
    user = query_db('SELECT is_admin FROM users WHERE id = %s', (user_id,), one=True)
    if not user or user['is_admin']:
        flash('Cannot delete this user.', 'danger')
    else:
        execute_db('DELETE FROM users WHERE id = %s', (user_id,))
        flash('User deleted.', 'info')
    return redirect(url_for('admin.users'))

# ============ DISEASES ============
@admin.route('/diseases')
@login_required
@admin_required
def diseases():
    disease_list = query_db('SELECT * FROM diseases ORDER BY name')
    return render_template('admin/diseases.html', diseases=disease_list)

@admin.route('/diseases/add', methods=['GET', 'POST'])
@login_required
@admin_required
def add_disease():
    if request.method == 'POST':
        try:
            execute_db(
                '''INSERT INTO diseases (name, description, category, severity, treatment, prevention,
                   specialist_required, is_contagious)
                   VALUES (%s, %s, %s, %s, %s, %s, %s, %s)''',
                (request.form['name'], request.form.get('description'),
                 request.form.get('category'), request.form.get('severity', 'mild'),
                 request.form.get('treatment'), request.form.get('prevention'),
                 request.form.get('specialist_required'),
                 1 if request.form.get('is_contagious') else 0)
            )
            flash('Disease added successfully!', 'success')
            return redirect(url_for('admin.diseases'))
        except Exception as e:
            flash(f'Error: {str(e)}', 'danger')
    return render_template('admin/disease_form.html', disease=None, action='Add')

@admin.route('/diseases/edit/<int:disease_id>', methods=['GET', 'POST'])
@login_required
@admin_required
def edit_disease(disease_id):
    disease = query_db('SELECT * FROM diseases WHERE id = %s', (disease_id,), one=True)
    if not disease:
        flash('Disease not found.', 'danger')
        return redirect(url_for('admin.diseases'))
    if request.method == 'POST':
        try:
            execute_db(
                '''UPDATE diseases SET name=%s, description=%s, category=%s, severity=%s,
                   treatment=%s, prevention=%s, specialist_required=%s, is_contagious=%s
                   WHERE id=%s''',
                (request.form['name'], request.form.get('description'),
                 request.form.get('category'), request.form.get('severity', 'mild'),
                 request.form.get('treatment'), request.form.get('prevention'),
                 request.form.get('specialist_required'),
                 1 if request.form.get('is_contagious') else 0, disease_id)
            )
            flash('Disease updated!', 'success')
            return redirect(url_for('admin.diseases'))
        except Exception as e:
            flash(f'Error: {str(e)}', 'danger')
    return render_template('admin/disease_form.html', disease=disease, action='Edit')

@admin.route('/diseases/delete/<int:disease_id>', methods=['POST'])
@login_required
@admin_required
def delete_disease(disease_id):
    execute_db('DELETE FROM diseases WHERE id = %s', (disease_id,))
    flash('Disease deleted.', 'info')
    return redirect(url_for('admin.diseases'))

# ============ SYMPTOMS ============
@admin.route('/symptoms')
@login_required
@admin_required
def symptoms():
    symptom_list = query_db('SELECT * FROM symptoms ORDER BY category, name')
    return render_template('admin/symptoms.html', symptoms=symptom_list)

@admin.route('/symptoms/add', methods=['POST'])
@login_required
@admin_required
def add_symptom():
    try:
        execute_db(
            'INSERT INTO symptoms (name, description, category, severity_level) VALUES (%s, %s, %s, %s)',
            (request.form['name'], request.form.get('description'),
             request.form.get('category'), request.form.get('severity_level', 'mild'))
        )
        flash('Symptom added!', 'success')
    except Exception as e:
        flash(f'Error: {str(e)}', 'danger')
    return redirect(url_for('admin.symptoms'))

@admin.route('/symptoms/delete/<int:symptom_id>', methods=['POST'])
@login_required
@admin_required
def delete_symptom(symptom_id):
    execute_db('DELETE FROM symptoms WHERE id = %s', (symptom_id,))
    flash('Symptom deleted.', 'info')
    return redirect(url_for('admin.symptoms'))

# ============ HOSPITALS ============
@admin.route('/hospitals')
@login_required
@admin_required
def hospitals():
    hospital_list = query_db('SELECT * FROM hospitals ORDER BY name')
    return render_template('admin/hospitals.html', hospitals=hospital_list)

@admin.route('/hospitals/add', methods=['GET', 'POST'])
@login_required
@admin_required
def add_hospital():
    if request.method == 'POST':
        try:
            execute_db(
                '''INSERT INTO hospitals (name, address, city, state, phone, email, specialties, emergency, rating)
                   VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)''',
                (request.form['name'], request.form.get('address'), request.form.get('city'),
                 request.form.get('state'), request.form.get('phone'), request.form.get('email'),
                 request.form.get('specialties'), 1 if request.form.get('emergency') else 0,
                 float(request.form.get('rating', 0)))
            )
            flash('Hospital added!', 'success')
            return redirect(url_for('admin.hospitals'))
        except Exception as e:
            flash(f'Error: {str(e)}', 'danger')
    return render_template('admin/hospital_form.html', hospital=None, action='Add')

@admin.route('/hospitals/edit/<int:hospital_id>', methods=['GET', 'POST'])
@login_required
@admin_required
def edit_hospital(hospital_id):
    hospital = query_db('SELECT * FROM hospitals WHERE id = %s', (hospital_id,), one=True)
    if not hospital:
        flash('Hospital not found.', 'danger')
        return redirect(url_for('admin.hospitals'))
    if request.method == 'POST':
        try:
            execute_db(
                '''UPDATE hospitals SET name=%s, address=%s, city=%s, state=%s, phone=%s,
                   email=%s, specialties=%s, emergency=%s, rating=%s WHERE id=%s''',
                (request.form['name'], request.form.get('address'), request.form.get('city'),
                 request.form.get('state'), request.form.get('phone'), request.form.get('email'),
                 request.form.get('specialties'), 1 if request.form.get('emergency') else 0,
                 float(request.form.get('rating', 0)), hospital_id)
            )
            flash('Hospital updated!', 'success')
            return redirect(url_for('admin.hospitals'))
        except Exception as e:
            flash(f'Error: {str(e)}', 'danger')
    return render_template('admin/hospital_form.html', hospital=hospital, action='Edit')

@admin.route('/hospitals/delete/<int:hospital_id>', methods=['POST'])
@login_required
@admin_required
def delete_hospital(hospital_id):
    execute_db('DELETE FROM hospitals WHERE id = %s', (hospital_id,))
    flash('Hospital deleted.', 'info')
    return redirect(url_for('admin.hospitals'))

# ============ PREDICTIONS ============
@admin.route('/predictions')
@login_required
@admin_required
def predictions():
    pred_list = query_db(
        '''SELECT p.*, u.username, u.email FROM predictions p
           JOIN users u ON p.user_id = u.id
           ORDER BY p.created_at DESC'''
    )
    return render_template('admin/predictions.html', predictions=pred_list)
