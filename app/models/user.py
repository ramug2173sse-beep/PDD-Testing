from flask_login import UserMixin
from app.db import query_db

class User(UserMixin):
    def __init__(self, id, username, email, full_name, is_admin, is_active, 
                 age=None, gender=None, phone=None, blood_group=None):
        self.id = id
        self.username = username
        self.email = email
        self.full_name = full_name
        self.is_admin = is_admin
        self._is_active = is_active
        self.age = age
        self.gender = gender
        self.phone = phone
        self.blood_group = blood_group

    @property
    def is_active(self):
        return self._is_active

    @staticmethod
    def get(user_id):
        """Load user by ID (used by Flask-Login)."""
        row = query_db(
            'SELECT * FROM users WHERE id = %s', (user_id,), one=True
        )
        if row:
            return User(
                id=row['id'],
                username=row['username'],
                email=row['email'],
                full_name=row['full_name'],
                is_admin=bool(row['is_admin']),
                is_active=bool(row['is_active']),
                age=row.get('age'),
                gender=row.get('gender'),
                phone=row.get('phone'),
                blood_group=row.get('blood_group'),
            )
        return None

    @staticmethod
    def get_by_email(email):
        return query_db('SELECT * FROM users WHERE email = %s', (email,), one=True)

    @staticmethod
    def get_by_username(username):
        return query_db('SELECT * FROM users WHERE username = %s', (username,), one=True)
