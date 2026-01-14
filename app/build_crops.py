import sqlite3
import json

DB_FILE = "data.db"

with open('crops.json', 'r') as f:
    crops_data = json.load(f)

db = sqlite3.connect(DB_FILE)
cursor = db.cursor()

for crop in crops_data:
    crop_id, name, growth_time, api_source = crop
    cursor.execute(
        "INSERT INTO crops (id, name, growth_time, progress, yield, season) VALUES (?, ?, ?, ?, ?, ?)",
        (crop_id, name, growth_time, 0, 0, 'Spring')
    )

db.commit()
db.close()

print(f"Inserted {len(crops_data)} crops into database")
