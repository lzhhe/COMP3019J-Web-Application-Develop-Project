from datetime import datetime

from flask import Blueprint, render_template, request, redirect, session
import requests
from .models import *

blue = Blueprint('cal_u', __name__)  # cal_u is name of blueprint


@blue.route('/')
@blue.route('/main')
def main():

    # uid = request.cookies.get('uid')
    # username = User.query.filter_by(UID=uid).first().name
    # username = session.get('user')
    return render_template('base.html')


@blue.route('/weekView')
def weekView():

    uid = request.cookies.get('uid')
    username = User.query.filter_by(UID=uid).first().name
    # username = session.get('user')
    return render_template('viewWeek.html', username=username)


@blue.route('/loginPage', methods=['GET', 'POST'])
def loginPage():
    # GET: 访问登录界面
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
            response.set_cookie('uid', str(user.UID), max_age=7*24*3600)
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
    response = redirect('main')





@blue.route('/')
@blue.route('/main')
def main():
    # uid = request.cookies.get('uid')
    # username = User.query.filter_by(UID=uid).first().name
    # username = session.get('user')
    return render_template('base.html')


@blue.route('/weekView')
def weekView():
    # cookie4,get内的与下面set的名一样
    uid = request.cookies.get('uid')
    username = User.query.filter_by(UID=uid).first().name
    # username = session.get('user')
    return render_template('viewWeek.html', username=username)


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
            response.set_cookie('uid', str(user.UID), max_age=7*24*3600)
            return response
        else:
            return 'login failed'