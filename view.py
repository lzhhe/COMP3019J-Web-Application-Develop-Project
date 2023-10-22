from flask import render_template, request, redirect, url_for, flash, session
from werkzeug.security import generate_password_hash, check_password_hash
from app import app, db
import User

app.secret_key = 'COMP3019J'
@app.route('/register/', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        # 从表单中获取用户输入的用户名、密码和邮箱
        username = request.form['signUpUsernameField']
        password = request.form['signUpPasswordField']
        email = request.form['signUpEmailField']

        # 检查用户名是否已存在于数据库中
        existing_user = User.query.filter_by(name=username).first()
        if existing_user:
            flash('用户名已存在，请选择其他用户名', 'danger')
        else:
            # 如果用户名不存在，将用户的密码进行哈希处理
            hashed_password = generate_password_hash(password, method='sha256')
            # 创建一个新用户对象
            new_user = User(name=username, password=hashed_password, email=email)
            # 将新用户添加到数据库中
            db.session.add(new_user)
            db.session.commit()
            # 注册成功后，将用户信息存储在session中
            session['user_id'] = new_user.UID  # 存储新注册用户的ID
            session['username'] = new_user.name  # 存储新注册用户的用户名

            flash('注册成功', 'success')
            # 注册成功后重定向到monthView页面
            return redirect(url_for('month_view'))

    # 如果请求的HTTP方法不是POST，或者用户注册失败，显示注册页面
    return render_template('login.html')
@app.route('/login/', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['signInUsernameField']
        password = request.form['signInPasswordField']
        button = request.form['signInSubmitField']

        # 查询用户是否存在
        user = User.query.filter_by(name=username).first()

        # 这行代码使用用户名从数据库中查询用户信息。假设User是你的用户模型，
        # .query.filter_by(name=username).first()表示在数据库中根据用户名查询用户信息。
        # first()函数返回查询到的第一个结果，如果没有找到匹配的用户，user会是None。

        # 这行代码检查用户是否存在并且输入的密码是否与数据库中存储的密码匹配
        if user and check_password_hash(user.password, password):
            session['user_id'] = user.get_UID()  # 将用户的ID存储在session中
            flash('登录成功', 'success')
            return redirect(url_for('month_view'))  # 跳转到monthView页面
        else:
            flash('登录失败，请检查用户名和密码', 'danger')

    return render_template('login.html')


@app.route('/monthView')
def month_view():
    # 获取用户ID（在session中存储的）
    user_id = session.get('user_id')

    # 使用user_id获取用户信息（这里假设有一个名为get_user_by_id的函数用于获取用户信息）
    user = User.get_user_by_id(user_id)

    # 将用户信息传递到模板中
    return render_template('monthView.html', user=user)


@app.route('/logout')
def logout():
    session.pop('user_id', None)
    flash('已登出', 'info')
    return redirect(url_for('login'))
