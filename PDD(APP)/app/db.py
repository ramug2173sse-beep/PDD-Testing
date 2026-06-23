import mysql.connector
from mysql.connector import pooling
from flask import current_app, g
import os

def get_db_config():
    """Get database config from Flask app config."""
    return {
        'host': current_app.config['MYSQL_HOST'],
        'port': current_app.config['MYSQL_PORT'],
        'user': current_app.config['MYSQL_USER'],
        'password': current_app.config['MYSQL_PASSWORD'],
        'database': current_app.config['MYSQL_DB'],
        'autocommit': False,
        'charset': 'utf8mb4',
        'collation': 'utf8mb4_unicode_ci',
    }

def get_db():
    """Get database connection, creating one if not already present in g."""
    if 'db' not in g:
        try:
            g.db = mysql.connector.connect(**get_db_config())
        except mysql.connector.Error as e:
            print(f"Database connection error: {e}")
            raise
    return g.db

def close_db(e=None):
    """Close database connection."""
    db = g.pop('db', None)
    if db is not None and db.is_connected():
        db.close()

def query_db(query, args=(), one=False, commit=False):
    """Execute a query and return results."""
    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(query, args)
        if commit:
            conn.commit()
            return cursor.lastrowid
        rv = cursor.fetchall()
        return (rv[0] if rv else None) if one else rv
    except mysql.connector.Error as e:
        conn.rollback()
        print(f"Query error: {e}")
        raise
    finally:
        cursor.close()

def execute_db(query, args=(), many=False):
    """Execute INSERT/UPDATE/DELETE and return lastrowid or rowcount."""
    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    try:
        if many:
            cursor.executemany(query, args)
        else:
            cursor.execute(query, args)
        conn.commit()
        return cursor.lastrowid
    except mysql.connector.Error as e:
        conn.rollback()
        print(f"Execute error: {e}")
        raise
    finally:
        cursor.close()

def init_db_connection(app):
    """Register db teardown with app."""
    app.teardown_appcontext(close_db)
