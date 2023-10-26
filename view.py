# from flask import render_template, request, redirect, url_for, flash, session, jsonify
# from werkzeug.security import generate_password_hash, check_password_hash
# from app import app, db
# from user import User
# from forms import RegistrationForm, LoginForm, FindPasswordForm
#
#
# @app.route('/register', methods=['POST'])
# def register():
#     reg_form = RegistrationForm()
#     response = {
#         'status': 'error',
#         'message': '未知错误'
#     }
#
#     if request.method == 'POST':
#         username = request.form['signUpUsernameField']
#         password = request.form['signUpPasswordField']
#         email = request.form['signUpEmailField']
#
#         existing_user = User.query.filter_by(name=username).first()
#
#         if existing_user:
#             response['message'] = '已存在此用户'
#         else:
#             hashed_password = generate_password_hash(password, method='sha256')
#             new_user = User(name=username, password=hashed_password, email=email)
#             db.session.add(new_user)
#             db.session.commit()
#             response['status'] = 'success'
#             response['message'] = '注册成功'
#     return jsonify(response)
#
# @app.route('/login', methods=['POST'])
# def login():
#     login_form = LoginForm()
#     response = {
#         'status': 'error',
#         'message': '登录失败'
#     }
#
#     username = request.form['signInUsernameField']
#     password = request.form['signInPasswordField']
#
#     user = User.query.filter_by(name=username).first()
#
#     if user and check_password_hash(user.password, password):
#         session['user_id'] = user.UID
#         response['status'] = 'success'
#         response['message'] = '登录成功'
#     else:
#         response['message'] = '密码有误'
#
#     return jsonify(response)
#
# @app.route('/find_password', methods=['POST'])
# def find_password():
#     find_form = FindPasswordForm()
#
#     response = {
#         'status': 'error',
#         'message': '找不到用户'
#     }
#
#     username = request.form['find_uname']
#     email = request.form['find_email']
#
#     user = User.query.filter_by(name=username, email=email).first()
#
#     if user:
#         response['status'] = 'info'
#         response['message'] = f'密码: {user.password}'  # 注意，这样做不是最佳实践，有安全风险
#
#     return jsonify(response)
#
# @app.route('/main')
# def month_view():
#     user_id = session.get('user_id')
#     user = User.get_user_by_id(user_id)
#
#     return render_template('base.html', user=user)
#
#
# @app.route('/logout')
# def logout():
#     session.pop('user_id', None)
#     flash('已登出', 'info')
#     return redirect(url_for('login'))
