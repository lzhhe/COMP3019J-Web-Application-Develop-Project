# view.py

from flask import request, jsonify, session, redirect, url_for, flash
from werkzeug.security import generate_password_hash, check_password_hash
from app import db, app
import User


@app.route('/register', methods=['POST'])
def register():
    username = request.form.get('signUpUsernameField')
    email = request.form.get('signUpEmailField')
    password = request.form.get('signUpPasswordField')
    hashed_password = generate_password_hash(password, method='sha256')

    # Check if user already exists
    user = User.get_user_by_name(username)
    if user:
        return jsonify({'message': 'Username already exists!'})

    # If not, create a new user and add to database
    new_user = User(name=username, email=email, password=hashed_password)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({'message': 'Registration successful!'})


@app.route('/login', methods=['POST'])
def login():
    username = request.form.get('signInUsernameField')
    password = request.form.get('signInPasswordField')

    user = User.get_user_by_name(username)
    if not user:
        return jsonify({'message': 'Username does not exist!'})

    if not check_password_hash(user.get_password, password):
        return jsonify({'message': 'Incorrect password!'})

    session['user'] = user.get_name
    return jsonify({'message': 'Logged in successfully!'})


@app.route('/find_password', methods=['POST'])
def find_password():
    # For simplicity, we're not actually implementing the password recovery function
    # Instead, just notify the user that an email has been sent
    return jsonify({'message': 'Email with password recovery instructions has been sent!'})


@app.route('/logout')
def logout():
    if 'user' in session:
        session.pop('user')
    return redirect(url_for('login'))

