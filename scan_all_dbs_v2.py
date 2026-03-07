import sqlite3
import os

def scan(name, path):
    if not os.path.exists(path):
        return
    print(f"\n--- Project: {name} | DB: {path} ---")
    try:
        conn = sqlite3.connect(path)
        cursor = conn.cursor()
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = cursor.fetchall()
        for (t,) in tables:
            if t.startswith('sqlite_') or t == '_prisma_migrations': continue
            cursor.execute(f'SELECT count(*) FROM "{t}"')
            count = cursor.fetchone()[0]
            print(f"  - {t}: {count} rows")
        conn.close()
    except Exception as e:
        print(f"  - Error scanning {path}: {e}")

base = '/home/red/바탕화면/scratch'
scan('billingtoclient', os.path.join(base, 'ndy-billingtoclient/prisma/dev.db'))
scan('truckingfreight', os.path.join(base, 'ndy-truckingfreight/prisma/dev.db'))
scan('dispatchlookup', os.path.join(base, 'ndy-dispatchlookup/prisma/auth/auth.db'))
scan('monthlyclosing', os.path.join(base, 'ndy-monthlyclosing/prisma/dev.db'))
scan('pickingsystem', os.path.join(base, 'ndy-pickingsystem/prisma/dev.db'))
