import os
import json
import sqlite3
from flask import Flask, render_template, redirect, url_for, session, request
import auth

app = Flask(__name__)
app.secret_key = os.urandom(24)
app.register_blueprint(auth.bp)
DB_FILE = "data.db"

@app.route('/')
def disp_homepage():
    if 'username' not in session:
        return redirect(url_for('auth.login_get'))
    return render_template('home.html', username=session['username'])

@app.route('/farm')
def disp_farm():
    if 'username' not in session:
        return redirect(url_for('auth.login_get'))
    return render_template('farm.html', username=session['username'])

@app.get('/api/load')
def load_game():
    if 'user_id' not in session:
        return {"error": "Unauthorized"}, 401
    db = sqlite3.connect(DB_FILE)
    c = db.cursor()
    c.execute("select money, game_state from progress where user_id = ?", (session['user_id'],))
    row = c.fetchone()
    
    c.execute("select id, name, cost, click_value, growth, emoji from crops")
    crops_rows = c.fetchall()
    crops = []
    for r in crops_rows:
        crops.append({
            "id": r[0],
            "name": r[1],
            "cost": r[2],
            "clickValue": r[3],
            "growth": r[4],
            "emoji": r[5]
        })
    
    db.close()
    if row:
        return {"money": row[0], "state": json.loads(row[1]), "crops": crops}
    return {"money": 15, "state": {}, "crops": crops}

@app.post('/api/save')
def save_game():
    if 'user_id' not in session:
        return {"error": "Unauthorized"}, 401
    data = request.json
    money = data.get('money')
    state = data.get('state')
    db = sqlite3.connect(DB_FILE)
    c = db.cursor()
    c.execute("update progress set money = ?, game_state = ? where user_id = ?", 
              (money, json.dumps(state), session['user_id']))
    db.commit()
    db.close()
    return {"status": "success"}

if __name__ == '__main__':
    app.run(debug=True)
