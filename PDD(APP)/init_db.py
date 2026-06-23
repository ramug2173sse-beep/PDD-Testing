import mysql.connector
import os
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
    env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '.env')
    parse_env_file(env_path)
    load_dotenv(env_path, override=False)


load_environment()

def init_db():
    host = os.getenv('MYSQL_HOST', 'localhost')
    user = os.getenv('MYSQL_USER', 'root')
    password = os.getenv('MYSQL_PASSWORD', '')
    dbname = os.getenv('MYSQL_DB', 'smat_db')

    print(f"Using MySQL host={host}, user={user}, database={dbname}")

    try:
        # 1. Connect to MySQL server
        print(f"Connecting to MySQL at {host}...")
        conn = mysql.connector.connect(
            host=host,
            user=user,
            password=password
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
                # Split by semicolon and filter out empty strings
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
                        # Log error but continue for seeding (some might fail if already exists)
                        print(f"Warning during seeding: {e}")
            conn.commit()

        print("\nDatabase initialized successfully! 🎉")
        cursor.close()
        conn.close()

    except mysql.connector.Error as err:
        if err.errno == 1045:
            print("Error: Access denied for MySQL. Please verify MYSQL_USER and MYSQL_PASSWORD in your .env file.")
            print("Current values loaded:")
            print(f"  MYSQL_HOST={host}")
            print(f"  MYSQL_USER={user}")
            print(f"  MYSQL_DB={dbname}")
            print("If your password contains special characters like '#', wrap it in quotes: MYSQL_PASSWORD=\"#Vengence1\"")
        else:
            print(f"Error: {err}")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")

if __name__ == "__main__":
    init_db()
