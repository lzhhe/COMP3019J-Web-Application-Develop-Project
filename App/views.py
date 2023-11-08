from datetime import datetime
from functools import wraps

from flask import Blueprint, render_template, request, redirect, session, url_for, g, app
from werkzeug.security import generate_password_hash, check_password_hash
import requests

from .forms import RegisterForm, LoginForm, FindForm, ChangeInfo, AddEvent
from .models import *

blue = Blueprint('cal_u', __name__)  # cal_u is name of blueprint


@blue.route('/')
@blue.route('/main')
def main():
    return render_template('base.html')


@blue.route('/draw')
def draw():
    return render_template('draw.html')


def session_required(fn):
    @wraps(fn)
    def inner(*args, **kwargs):
        if g.user:
            return fn(*args, **kwargs)
        else:
            return redirect('loginPage')

    return inner


@blue.route('/weekView')
@session_required
def weekView():
    # uid = request.cookies.get('uid')
    user = g.user
    if user.status == 1:
        return render_template('viewWeek.html')
    elif user.status == 2:
        response = redirect(url_for('cal_t.teacherView'))
    else:
        response = redirect(url_for('cal_a.adminView'))
    return response


@blue.route('/monthView')
@session_required
def monthView():
    # uid = request.cookies.get('uid')
    user = g.user
    if user.status == 1:
        return render_template('viewMonth.html')
    elif user.status == 2:
        response = redirect(url_for('cal_t.teacherView'))
    else:
        response = redirect(url_for('cal_a.adminView'))
    return response


@blue.route('/yearView')
@session_required
def yearView():
    # uid = request.cookies.get('uid')
    user = g.user
    if user.status == 1:
        return render_template('viewYear.html')
    elif user.status == 2:
        response = redirect(url_for('cal_t.teacherView'))
    else:
        response = redirect(url_for('cal_a.adminView'))
    return response


@blue.route('/loginPage', methods=['GET', 'POST'])  # 这是默认访问路径
def loginPage():
    if request.method == 'GET':
        return render_template('loginMix.html')


@blue.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'GET':
        return render_template('loginMix.html')
    elif request.method == 'POST':
        form = LoginForm(request.form)
        if form.validate():
            username = form.signInUsernameField.data  # 修改这里
            password = form.signInPasswordField.data  # 修改这里
            user = User.query.filter_by(username=username).first()
            if check_password_hash(user.password, password):
                if user.status == 1:
                    response = redirect('/weekView')
                elif user.status == 2:
                    response = redirect(url_for('cal_t.teacherView'))
                else:
                    response = redirect(url_for('cal_a.adminView'))
                session['uid'] = user.UID
                return response
            else:
                return render_template('loginMix.html', errors="the password is wrong")
        else:
            return render_template('loginMix.html', errors=form.errors)


@blue.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'GET':
        return render_template('loginMix.html')
    elif request.method == 'POST':
        form = RegisterForm(request.form)
        if form.validate():
            email = form.signUpEmailField.data  # 修改这里
            username = form.signUpUsernameField.data  # 修改这里
            password = form.signUpPasswordField.data  # 修改这里
            user = User(email=email, username=username, password=generate_password_hash(password))
            db.session.add(user)
            db.session.commit()

            response = redirect('/weekView')
            session['uid'] = user.UID
            return response
        else:
            print(form.errors)
            return render_template('loginMix.html', errors=form.errors)


@blue.route('/find_password', methods=['GET', 'POST'])
def find_password():
    if request.method == 'GET':
        return render_template('loginMix.html')
    elif request.method == 'POST':
        form = FindForm(request.form)
        if form.validate():
            username = form.find_uname.data  # 修改这里
            email = form.find_email.data  # 修改这里
            password = form.find_password.data  # 修改这里
            user = User.query.filter_by(username=username).first()
            if email == user.email:
                user.password = generate_password_hash(password)
                db.session.commit()
                response = redirect('/weekView')
                session['uid'] = user.UID
                return response
            else:
                return render_template('loginMix.html', errors="the email is wrong")
        else:  # 用户不存在
            print(form.errors)
            return render_template('loginMix.html', errors=form.errors)


@blue.route('/changeInfor', methods=['GET', 'POST'])
def changeInfor():
    if request.method == 'GET':
        return redirect('/weekView')
    else:
        form = ChangeInfo(request.form)
        if form.validate():
            user = g.user
            password = form.new_password.data
            gender = form.choose_gender.data
            grade = form.choose_grade.data
            if password:
                user.password = generate_password_hash(password)
            if gender:
                user.gender = gender
            if grade:
                user.grade = grade
            db.session.commit()

            return redirect(url_for('cal_u.weekView'))
        else:
            return redirect(url_for('cal_u.weekView', error="the username has existed"))


@blue.route('/addEvent', methods=['GET', 'POST'])
def changeInfor():
    if request.method == 'GET':
        return redirect('/addEvent')
    else:
        form = AddEvent(request.form)
        if form.validate():
            user = g.user
            db.session.commit()
            return redirect(url_for('cal_u.weekView'))
        else:
            return redirect(url_for('cal_u.weekView', error="The event may be has some problem"))





@blue.route('/logout')
def logout():
    session.pop('uid')
    response = redirect('main')
    return response
