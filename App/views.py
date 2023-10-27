from datetime import datetime
from functools import wraps

from flask import Blueprint, render_template, request, redirect, session, url_for
import requests
from .models import *

blue = Blueprint('cal_u', __name__)  # cal_u is name of blueprint


@blue.route('/')
@blue.route('/main')
def main():
    return render_template('base.html')


def session_required(fn):
    @wraps(fn)
    def inner(*args, **kwargs):
        uid = session.get('uid')
        if uid:
            user = User.query.get(uid)
            request.user = user
            return fn(*args, **kwargs)
        else:
            return redirect('loginPage')

    return inner


@blue.route('/weekView')
@session_required
def weekView():
    # uid = request.cookies.get('uid')
    user = request.user
    username = user.name
    gender = user.gender
    email = user.email
    if gender == 1:
        gender_pic = '../static/pic/male.jpg'
    elif gender == 2:
        gender_pic = '../static/pic/female.jpg'
    else:
        gender_pic = '../static/pic/forgetHead.png'
    return render_template('viewWeek.html', username=username, gender_pic=gender_pic, email=email)


@blue.route('/loginPage', methods=['GET', 'POST'])  # 这是默认访问路径
def loginPage():
    if request.method == 'GET':
        return render_template('loginMix.html')


@blue.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'GET':
        return render_template('loginMix.html')
    elif request.method == 'POST':
        username = request.form.get('signInUsernameField')
        password = request.form.get('signInPasswordField')
        user = User.query.filter_by(name=username, password=password).first()
        if user:
            response = redirect('/weekView')
            session['uid'] = user.UID
            return response
        else:
            return 'login failed'


@blue.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'GET':
        return render_template('loginMix.html')
    elif request.method == 'POST':
        return '111'


@blue.route('/find_password', methods=['GET', 'POST'])
def find_password():
    if request.method == 'GET':
        return render_template('loginMix.html')
    elif request.method == 'POST':
        return '111'


@blue.route('/logout')
def logout():
    session.pop('uid')
    response = redirect('main')
    return response
