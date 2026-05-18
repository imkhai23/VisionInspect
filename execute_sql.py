import sys
sys.path.insert(0, 'd:\VisionInspect\backend')
from app.config import get_settings
import psycopg2

settings = get_settings()

# Parse Supabase URL to get project ID
url = settings.supabase_url
project_id = url.replace('https://', '').split('.')[0]

print(f"Connecting to {project_id}.db.supabase.co...")

# Connect to Supabase PostgreSQL
conn = psycopg2.connect(
    host=f'{project_id}.db.supabase.co',
    database='postgres',
    user='postgres',
    password=settings.supabase_service_role_key,
    sslmode='require'
)

print('✓ Connected to Supabase PostgreSQL')

# Read SQL file
with open('d:\VisionInspect\supabase_setup.sql', 'r') as f:
    sql_content = f.read()

# Execute the SQL
cursor = conn.cursor()
cursor.execute(sql_content)
conn.commit()
cursor.close()
conn.close()

print('✅ Schema created successfully!')
