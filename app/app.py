import sys
import os
from flask import Flask, render_template, redirect, url_for, session
import auth

app = Flask(__name__)
app.secret_key = os.urandom(24)
app.register_blueprint(auth.bp)

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

if __name__ == '__main__':
    app.run(debug=True)
