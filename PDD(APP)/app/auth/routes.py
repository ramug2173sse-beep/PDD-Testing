from flask import render_template, redirect, url_for, flash, request, session
from flask_login import login_user, logout_user, current_user, login_required
from . import auth
from app.db import query_db, execute_db
from app.models.user import User
from app import bcrypt, login_manager

@login_manager.user_loader
def load_user(user_id):
    return User.get(int(user_id))

@auth.route('/register', methods=['GET', 'POST'])
def register():
    if current_user.is_authenticated:
        return redirect(url_for('main.index'))
    
    if request.method == 'POST':
        username = request.form.get('username', '').strip()
        email = request.form.get('email', '').strip().lower()
        password = request.form.get('password', '')
        confirm_password = request.form.get('confirm_password', '')
        full_name = request.form.get('full_name', '').strip()
        age = request.form.get('age', '')
        gender = request.form.get('gender', '')
        phone = request.form.get('phone', '').strip()
        blood_group = request.form.get('blood_group', '')

        # Validations
        errors = []
        if not username or len(username) < 3:
            errors.append('Username must be at least 3 characters.')
        if not email or '@' not in email:
            errors.append('Please enter a valid email address.')
        if not password or len(password) < 6:
            errors.append('Password must be at least 6 characters.')
        if password != confirm_password:
            errors.append('Passwords do not match.')
        
        if not errors:
            # Check uniqueness
            if User.get_by_email(email):
                errors.append('Email address already registered.')
            if User.get_by_username(username):
                errors.append('Username already taken.')

        if errors:
            for error in errors:
                flash(error, 'danger')
            return render_template('auth/register.html',
                                   username=username, email=email, full_name=full_name,
                                   age=age, gender=gender, phone=phone, blood_group=blood_group)

        pw_hash = bcrypt.generate_password_hash(password).decode('utf-8')
        try:
            execute_db(
                '''INSERT INTO users (username, email, password_hash, full_name, age, gender, phone, blood_group)
                   VALUES (%s, %s, %s, %s, %s, %s, %s, %s)''',
                (username, email, pw_hash, full_name, age or None, gender or None, phone or None, blood_group or None)
            )
            flash('Registration successful! Please log in.', 'success')
            return redirect(url_for('auth.login'))
        except Exception as e:
            flash('Registration failed. Please try again.', 'danger')
            return render_template('auth/register.html')

    return render_template('auth/register.html')


@auth.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('main.index'))

    if request.method == 'POST':
        identifier = request.form.get('identifier', '').strip()
        password = request.form.get('password', '')
        remember = request.form.get('remember', False)

        # Allow login by email OR username
        user_row = query_db('SELECT * FROM users WHERE email = %s OR username = %s',
                            (identifier, identifier), one=True)

        if user_row and bcrypt.check_password_hash(user_row['password_hash'], password):
            if not user_row['is_active']:
                flash('Your account has been deactivated. Contact admin.', 'danger')
                return redirect(url_for('auth.login'))
            user_obj = User(
                id=user_row['id'],
                username=user_row['username'],
                email=user_row['email'],
                full_name=user_row['full_name'],
                is_admin=bool(user_row['is_admin']),
                is_active=bool(user_row['is_active']),
                age=user_row.get('age'),
                gender=user_row.get('gender'),
                phone=user_row.get('phone'),
                blood_group=user_row.get('blood_group'),
            )
            login_user(user_obj, remember=bool(remember))
            next_page = request.args.get('next')
            flash(f'Welcome back, {user_obj.full_name or user_obj.username}!', 'success')
            if user_obj.is_admin:
                return redirect(next_page or url_for('admin.dashboard'))
            return redirect(next_page or url_for('main.dashboard'))
        else:
            flash('Invalid credentials. Please try again.', 'danger')

    return render_template('auth/login.html')


@auth.route('/logout')
@login_required
def logout():
    logout_user()
    flash('You have been logged out successfully.', 'info')
    return redirect(url_for('auth.login'))


@auth.route('/profile', methods=['GET', 'POST'])
@login_required
def profile():
    if request.method == 'POST':
        full_name = request.form.get('full_name', '').strip()
        age = request.form.get('age', '')
        gender = request.form.get('gender', '')
        phone = request.form.get('phone', '').strip()
        blood_group = request.form.get('blood_group', '')
        address = request.form.get('address', '').strip()
        
        try:
            execute_db(
                '''UPDATE users SET full_name=%s, age=%s, gender=%s, phone=%s, blood_group=%s, address=%s
                   WHERE id=%s''',
                (full_name, age or None, gender or None, phone or None, blood_group or None, address or None, current_user.id)
            )
            flash('Profile updated successfully!', 'success')
        except Exception:
            flash('Failed to update profile.', 'danger')
        return redirect(url_for('auth.profile'))

    user_data = query_db('SELECT * FROM users WHERE id = %s', (current_user.id,), one=True)
    return render_template('auth/profile.html', user=user_data)


@auth.route('/change-password', methods=['POST'])
@login_required
def change_password():
    current_pw = request.form.get('current_password', '')
    new_pw = request.form.get('new_password', '')
    confirm_pw = request.form.get('confirm_password', '')

    user_row = query_db('SELECT password_hash FROM users WHERE id = %s', (current_user.id,), one=True)
    if not bcrypt.check_password_hash(user_row['password_hash'], current_pw):
        flash('Current password is incorrect.', 'danger')
    elif len(new_pw) < 6:
        flash('New password must be at least 6 characters.', 'danger')
    elif new_pw != confirm_pw:
        flash('New passwords do not match.', 'danger')
    else:
        new_hash = bcrypt.generate_password_hash(new_pw).decode('utf-8')
        execute_db('UPDATE users SET password_hash = %s WHERE id = %s', (new_hash, current_user.id))
        flash('Password changed successfully!', 'success')

    return redirect(url_for('auth.profile'))
