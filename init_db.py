import mysql.connector
import sqlite3
import os
import re
from dotenv import load_dotenv

def parse_env_file(env_path):
    """Parse a .env file and preserve values containing # characters."""
    if not os.path.exists(env_path):
        return

    with open(env_path, 'r', encoding='utf-8') as f:
        for raw_line in f:
            line = raw_line.strip()
            if not line or line.startswith('#'):
                continue
            if '=' not in line:
                continue

            key, value = line.split('=', 1)
            key = key.strip()
            value = value.strip()

            if ((value.startswith('"') and value.endswith('"')) or
                    (value.startswith("'") and value.endswith("'"))):
                value = value[1:-1]

            os.environ.setdefault(key, value)

def load_environment():
    env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '.env')
    parse_env_file(env_path)
    load_dotenv(env_path, override=False)

load_environment()

def clean_sql_for_sqlite(sql):
    # Basic mysql to sqlite conversion rules
    sql = sql.replace('CREATE DATABASE IF NOT EXISTS smat_db;', '')
    sql = sql.replace('USE smat_db;', '')
    sql = sql.replace('INT AUTO_INCREMENT PRIMARY KEY', 'INTEGER PRIMARY KEY AUTOINCREMENT')
    sql = sql.replace('INT AUTO_INCREMENT', 'INTEGER PRIMARY KEY AUTOINCREMENT')
    sql = sql.replace('INT NOT NULL AUTO_INCREMENT', 'INTEGER PRIMARY KEY AUTOINCREMENT')
    sql = sql.replace('INT ', 'INTEGER ')
    sql = sql.replace('INT,', 'INTEGER,')
    sql = sql.replace('INT\n', 'INTEGER\n')
    sql = sql.replace('INT)', 'INTEGER)')
    
    # Replace any ENUM(...) with TEXT
    sql = re.sub(r'ENUM\([^)]+\)', 'TEXT', sql)
    
    sql = sql.replace("ON UPDATE CURRENT_TIMESTAMP", "")
    sql = sql.replace("UNIQUE KEY unique_ds (disease_id, symptom_id)", "UNIQUE (disease_id, symptom_id)")
    sql = sql.replace("INSERT IGNORE", "INSERT OR IGNORE")
    sql = sql.replace("RAND()", "random()")
    return sql

def init_sqlite_db():
    print("\nFalling back to SQLite database initialization...")
    db_path = 'smat.db'
    if os.path.exists(db_path):
        try:
            os.remove(db_path)
        except Exception:
            pass

    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()

        # Run schema
        schema_path = os.path.join('database', 'schema.sql')
        if os.path.exists(schema_path):
            print(f"Executing {schema_path} for SQLite...")
            with open(schema_path, 'r', encoding='utf-8') as f:
                schema_sql = clean_sql_for_sqlite(f.read())
                statements = [s.strip() for s in schema_sql.split(';') if s.strip()]
                for statement in statements:
                    cursor.execute(statement)
            conn.commit()

        # Run seed
        seed_path = os.path.join('database', 'seed.sql')
        if os.path.exists(seed_path):
            print(f"Executing {seed_path} for SQLite...")
            with open(seed_path, 'r', encoding='utf-8') as f:
                seed_sql = clean_sql_for_sqlite(f.read())
                statements = [s.strip() for s in seed_sql.split(';') if s.strip()]
                for statement in statements:
                    cursor.execute(statement)
            conn.commit()

        # Seed default users
        from flask_bcrypt import Bcrypt
        bcrypt = Bcrypt()
        admin_hash = bcrypt.generate_password_hash('Admin@123').decode('utf-8')
        user_hash = bcrypt.generate_password_hash('password123').decode('utf-8')

        cursor.execute(
            """INSERT INTO users (username, email, password_hash, full_name, is_admin, is_active)
               VALUES (?, ?, ?, ?, ?, ?)""",
            ('admin', 'admin@smat.com', admin_hash, 'System Administrator', 1, 1)
        )
        cursor.execute(
            """INSERT INTO users (username, email, password_hash, full_name, is_admin, is_active)
               VALUES (?, ?, ?, ?, ?, ?)""",
            ('user', 'user@smat.com', user_hash, 'John Doe', 0, 1)
        )
        conn.commit()

        print("SQLite Database initialized and seeded successfully with default users!")
        print("  - Admin User : admin@smat.com / Admin@123")
        print("  - Normal User: user@smat.com / password123")
        conn.close()
    except Exception as e:
        print(f"Error during SQLite initialization: {e}")

def init_db():
    host = os.getenv('MYSQL_HOST', 'localhost')
    port = int(os.getenv('MYSQL_PORT', 3306))
    user = os.getenv('MYSQL_USER', 'root')
    password = os.getenv('MYSQL_PASSWORD', '')
    dbname = os.getenv('MYSQL_DB', 'smat_db')

    print(f"Using MySQL host={host}, port={port}, user={user}, database={dbname}")

    try:
        # 1. Connect to MySQL server
        print(f"Connecting to MySQL at {host}:{port}...")
        conn = mysql.connector.connect(
            host=host,
            port=port,
            user=user,
            password=password,
            connect_timeout=2
        )
        cursor = conn.cursor()

        # 2. Create Database
        print(f"Creating database '{dbname}' if not exists...")
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {dbname}")
        conn.commit()
        
        # 3. Switch to DB
        cursor.execute(f"USE {dbname}")

        # 4. Run schema.sql
        schema_path = os.path.join('database', 'schema.sql')
        if os.path.exists(schema_path):
            print(f"Executing {schema_path}...")
            with open(schema_path, 'r', encoding='utf-8') as f:
                schema_sql = f.read()
                statements = [s.strip() for s in schema_sql.split(';') if s.strip()]
                for statement in statements:
                    cursor.execute(statement)
            conn.commit()

        # 5. Run seed.sql
        seed_path = os.path.join('database', 'seed.sql')
        if os.path.exists(seed_path):
            print(f"Executing {seed_path}... (This may take a moment)")
            with open(seed_path, 'r', encoding='utf-8') as f:
                seed_sql = f.read()
                statements = [s.strip() for s in seed_sql.split(';') if s.strip()]
                for statement in statements:
                    try:
                        cursor.execute(statement)
                    except Exception as e:
                        print(f"Warning during seeding: {e}")
            conn.commit()

        print("\nMySQL Database initialized successfully!")
        cursor.close()
        conn.close()

    except mysql.connector.Error as err:
        print(f"MySQL Connection failed: {err}")
        init_sqlite_db()
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        init_sqlite_db()

if __name__ == "__main__":
    init_db()
