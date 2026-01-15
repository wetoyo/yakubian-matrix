import requests
import json
import random
import urllib.request
import sqlite3, os
from typing import List, Dict, Optional

DB_FILE = "data.db"
db = sqlite3.connect(DB_FILE)
cursor = db.cursor()

cursor.executescript(
    """
    DROP TABLE IF EXISTS progress;
    DROP TABLE IF EXISTS users;
    CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
    );
    CREATE TABLE progress (
    user_id INTEGER PRIMARY KEY,
    money INTEGER DEFAULT 0,
    game_state TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id)
    );
    """
)

cursor.executescript(
    """
    DROP TABLE IF EXISTS crops;
    CREATE TABLE crops (
    id TEXT PRIMARY KEY,
    name TEXT,
    cost INTEGER,
    click_value INTEGER,
    growth INTEGER,
    emoji TEXT
    );
    """
)

cursor.executescript(
    """
    INSERT INTO crops (id, name, cost, click_value, growth, emoji) VALUES 
    ('carrot', 'Carrot', 5, 1, 3, '🥕'),
    ('potato', 'Potato', 10, 2, 4, '🥔'),
    ('tomato', 'Tomato', 25, 5, 6, '🍅'),
    ('wheat', 'Wheat', 100, 20, 12, '🌾'),
    ('pumpkin', 'Pumpkin', 500, 120, 30, '🎃'),
    ('corn', 'Corn', 2000, 500, 60, '🌽');
    """
)

db.commit()
db.close()

