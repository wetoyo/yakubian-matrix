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
    DROP TABLE IF EXISTS users;
    CREATE TABLE users (
    username TEXT PRIMARY KEY,
    password TEXT
    );
    """
)

cursor.executescript(
    """
    DROP TABLE IF EXISTS crops;
    CREATE TABLE crops (
    id INTEGER PRIMARY KEY,
    name TEXT,
    growth_time INTEGER,
    progress INTEGER,
    yield INTEGER,
    season TEXT
    );
    """
)

cursor.executescript(
    """
    DROP TABLE IF EXISTS tools;
    CREATE TABLE tools (
    id TEXT UNIQUE,
    name TEXT,
    effect INTEGER,
    cost INTEGER
    );
    """
)

db.commit()
db.close()
