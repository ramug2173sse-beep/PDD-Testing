import sqlite3
from flask import current_app, g
import os

def dict_factory(cursor, row):
    d = {}
    for idx, col in enumerate(cursor.description):
        d[col[0]] = row[idx]
    return d

def get_db():
    """Get database connection, creating one if not already present in g."""
    if 'db' not in g:
        db_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'smat.db')
        try:
            g.db = sqlite3.connect(db_path)
            g.db.row_factory = dict_factory
        except sqlite3.Error as e:
            print(f"Database connection error: {e}")
            raise
    return g.db

def close_db(e=None):
    """Close database connection."""
    db = g.pop('db', None)
    if db is not None:
        db.close()

def query_db(query, args=(), one=False, commit=False):
    """Execute a query and return results."""
    # Convert %s placeholders to ? for sqlite
    query = query.replace('%s', '?')
    # Convert RAND() to random() for sqlite compatibility
    query = query.replace('RAND()', 'random()')
    conn = get_db()
    cursor = conn.cursor()
    try:
        cursor.execute(query, args)
        if commit:
            conn.commit()
            return cursor.lastrowid
        rv = cursor.fetchall()
        return (rv[0] if rv else None) if one else rv
    except sqlite3.Error as e:
        conn.rollback()
        print(f"Query error: {e}")
        raise
    finally:
        cursor.close()

def execute_db(query, args=(), many=False):
    """Execute INSERT/UPDATE/DELETE and return lastrowid or rowcount."""
    # Convert %s placeholders to ? for sqlite
    query = query.replace('%s', '?')
    # Convert RAND() to random() for sqlite compatibility
    query = query.replace('RAND()', 'random()')
    conn = get_db()
    cursor = conn.cursor()
    try:
        if many:
            cursor.executemany(query, args)
        else:
            cursor.execute(query, args)
        conn.commit()
        return cursor.lastrowid
    except sqlite3.Error as e:
        conn.rollback()
        print(f"Execute error: {e}")
        raise
    finally:
        cursor.close()

def init_db_connection(app):
    """Register db teardown with app."""
    app.teardown_appcontext(close_db)
