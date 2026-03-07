import sqlite3
import os

projects = [
    'ndy-billingtoclient',
    'ndy-dispatchlookup',
    'ndy-pickingsystem',
    'ndy-truckingfreight',
    'ndy-tb',
    'ndy-monthlyclosing'
]

base_dir = '/home/red/바탕화면/scratch'

print("--- FULL PROJECT DB SCAN ---")

for project in projects:
    project_path = os.path.join(base_dir, project)
    if not os.path.exists(project_path):
        continue
    
    # DB 파일 후보들
    db_files = [
        'prisma/dev.db',
        'prisma/auth/auth.db',
        'auth.db'
    ]
    
    found_any = False
    for db_rel in db_files:
        db_path = os.path.join(project_path, db_rel)
        if os.path.exists(db_path):
            found_any = True
            print(f"\n[Project: {project}] DB: {db_rel}")
            try:
                conn = sqlite3.connect(db_path)
                cursor = conn.cursor()
                cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
                tables = cursor.fetchall()
                for (table_name,) in tables:
                    if table_name.startswith('sqlite_') or table_name == '_prisma_migrations':
                        continue
                    cursor.execute(f'SELECT count(*) FROM "{table_name}"')
                    count = cursor.fetchone()[0]
                    if count > 0:
                        print(f"  - {table_name}: {count} rows")
                conn.close()
            except Exception as e:
                print(f"  - Error: {e}")
    
    if not found_any:
        print(f"\n[Project: {project}] No .db files found in standard locations.")
