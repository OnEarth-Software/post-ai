import psycopg2

conn = psycopg2.connect('postgresql://postgres.iuiuuxyobsnuykfgkunl:zp1LR4Fo9bBeeoGn@aws-0-eu-west-1.pooler.supabase.com:5432/postgres')
cur = conn.cursor()
cur.execute("UPDATE users SET role = 'admin' WHERE email = 'admin@admin.com'")
conn.commit()
print('Admin updated!')
