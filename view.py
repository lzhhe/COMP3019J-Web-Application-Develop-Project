from flask import render_template, request, redirect, url_for, flash, session
from werkzeug.security import generate_password_hash, check_password_hash
from app import app, db
import User


@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        email = request.form['email']

        # 检查用户名是否已存在
        existing_user = User.query.filter_by(name=username).first()
        if existing_user:
            flash('用户名已存在，请选择其他用户名', 'danger')
        else:
            # 创建新用户
            hashed_password = generate_password_hash(password, method='sha256')
            new_user = User(name=username, password=hashed_password, email=email)
            db.session.add(new_user)
            db.session.commit()
            flash('注册成功，请登录', 'success')
            return redirect(url_for('login'))

    return render_template('register.html')


@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']

        # 查询用户是否存在
        user = User.query.filter_by(name=username).first()
        if user and check_password_hash(user.password, password):
            session['user_id'] = user.UID
            flash('登录成功', 'success')
            return redirect(url_for('profile'))
        else:
            flash('登录失败，请检查用户名和密码', 'danger')

    return render_template('login.html')


@app.route('/logout')
def logout():
    session.pop('user_id', None)
    flash('已登出', 'info')
    return redirect(url_for('login'))
