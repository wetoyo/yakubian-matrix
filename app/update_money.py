import sqlite3

DB_FILE = "data.db"
db = sqlite3.connect(DB_FILE)
c = db.cursor()

# Get the first user
c.execute("SELECT user_id FROM progress LIMIT 1")
row = c.fetchone()

if row:
    user_id = row[0]
    c.execute("UPDATE progress SET money = 10000 WHERE user_id = ?", (user_id,))
    db.commit()
    print(f"Updated money for user_id {user_id} to 10,000")
else:
    print("No users found in progress table")

db.close()
