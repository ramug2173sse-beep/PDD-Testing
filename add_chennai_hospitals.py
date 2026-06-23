import mysql.connector
import os
from dotenv import load_dotenv

load_dotenv()

def add_hospitals():
    host = os.getenv('MYSQL_HOST', 'localhost')
    port = int(os.getenv('MYSQL_PORT', 3306))
    user = os.getenv('MYSQL_USER', 'root')
    password = os.getenv('MYSQL_PASSWORD', '')
    dbname = os.getenv('MYSQL_DB', 'smat_db')

    hospitals = [
        ('Apollo Hospitals', '21, Greams Lane, Off Greams Road', 'Chennai', 'Tamil Nadu', '+91-44-28293333', 'info@apollochennai.com', 'Cardiology,Neurology,Oncology,Orthopedics', True, 4.8),
        ('MGM Healthcare', '72, Nelson Manickam Road, Aminjikarai', 'Chennai', 'Tamil Nadu', '+91-44-45242424', 'info@mgmhealthcare.in', 'Multi-Specialty,Cardiology,Transplant', True, 4.7),
        ('MIOT International', '4/112, Mount Poonamallee Road, Manapakkam', 'Chennai', 'Tamil Nadu', '+91-44-45021000', 'info@miotinternational.com', 'Orthopedics,Cardiology,Nephrology,Multi-Specialty', True, 4.6),
        ('SIMS Hospital', 'No.1, Jawaharlal Nehru Salai, Vadapalani', 'Chennai', 'Tamil Nadu', '+91-44-20002001', 'info@simshospitals.com', 'Multi-Specialty,Cardiology,Gastroenterology,Oncology', True, 4.7),
        ('Kauvery Hospital', 'No. 199, Luz Church Rd, Alwarpet', 'Chennai', 'Tamil Nadu', '+91-44-40006000', 'info@kauveryhospital.com', 'Cardiology,Geriatrics,Multi-Specialty', True, 4.6),
        ('The Madras Medical Mission', '4-A, Dr. J. Jayalalithaa Nagar, Mogappair', 'Chennai', 'Tamil Nadu', '+91-44-26565961', 'info@mmm.org.in', 'Cardiology,Oncology,Transplant', True, 4.7)
    ]

    try:
        conn = mysql.connector.connect(
            host=host,
            port=port,
            user=user,
            password=password,
            database=dbname
        )
        cursor = conn.cursor()

        sql = """INSERT IGNORE INTO hospitals (name, address, city, state, phone, email, specialties, emergency, rating) 
                 VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)"""
        
        cursor.executemany(sql, hospitals)
        conn.commit()

        print(f"Successfully added {cursor.rowcount} Chennai hospitals to the database!")
        
        cursor.close()
        conn.close()

    except mysql.connector.Error as err:
        print(f"Error: {err}")

if __name__ == "__main__":
    add_hospitals()
