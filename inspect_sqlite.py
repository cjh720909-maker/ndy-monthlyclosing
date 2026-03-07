import sqlite3
import os

db_path = './prisma/dev.db'
if not os.path.exists(db_path):
    print(f"Error: {db_path} not found")
    exit(1)

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

try:
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
    tables = cursor.fetchall()
    print(f"Tables found in SQLite: {[t[0] for t in tables]}")
    
    for (table_name,) in tables:
        cursor.execute(f'SELECT count(*) FROM "{table_name}"')
        count = cursor.fetchone()[0]
        print(f"Table [{table_name}]: {count} rows")
        
        if count > 0 and 'AdditionalCost' in table_name:
            cursor.execute(f'SELECT * FROM "{table_name}" LIMIT 2')
            rows = cursor.fetchall()
            print(f"Sample data from {table_name}: {rows}")

except Exception as e:
    print(f"Error: {e}")
finally:
    conn.close()
