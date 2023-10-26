from datetime import datetime

from flask import Blueprint, render_template, request, redirect, session
import requests
from .models import *

blue = Blueprint('cal_u', __name__)  # cal_u是这个蓝图的名称，全局一致即可


@blue.route('/')  # 这是默认访问路径
@blue.route('/main')
def main():
    # cookie4,get内的与下面set的名一样
    # username = request.cookies.get('user')
    username = session.get('user')
    return render_template('base.html', username=username)


@blue.route('/weekView')
def weekView():
    # cookie4,get内的与下面set的名一样
    # username = request.cookies.get('user')
    username = session.get('user')
    return render_template('viewWeek.html', username=username)


@blue.route('/loginPage', methods=['GET', 'POST'])  # 这是默认访问路径
def loginPage():
    # GET: 访问登录界面
    if request.method == 'GET':
        return render_template('loginMix.html')
    elif request.method == 'POST':
        # cookie1 得到内容
        username = request.form.get('signInUsernameField')
        password = request.form.get('signInPasswordField')
        # cookie2 设置cookie
        if username == 'zx' and password == '12345678':
            response = redirect('/weekView')
            # cookie3 # 默认浏览器关闭没了
            # response.set_cookie('user', username, max_age=3600 * 24 * 7)
            # response.set_cookie('user', username, expires=datetime(2023, 12, 12))
            session['user'] = username
            session.permanent = True
            return response
        else:
            return 'wrong'


@blue.route('/logout')
def logout():
    response = redirect('main')
    # cookie5 删除cookie
    # response.delete_cookie('user')

    session.pop('user')
    return response
