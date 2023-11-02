from datetime import datetime
from functools import wraps

from flask import Blueprint, render_template, request, redirect, session, url_for, g
from werkzeug.security import generate_password_hash, check_password_hash
import requests

from .forms import RegisterForm, LoginForm, FindForm, ChangeInfo
from .models import *

teacher = Blueprint('cal_t', __name__, url_prefix="/teacher")  # cal_u is name of blueprint


@teacher.route('/teacherView')
def teacherView():
    # uid = request.cookies.get('uid')
    user = g.user
    return render_template('teacherView.html')


@teacher.route('/changeInfor', methods=['GET', 'POST'])
def changeInfor():
    if request.method == 'GET':
        return redirect('/teacherView')
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

            return redirect(url_for('cal_t.teacherView'))
        else:
            return redirect(url_for('cal_t.teacherView', error="the username has existed"))


@teacher.route('/logout')
def logout():
    session.pop('uid')
    response = redirect('main')
    return response
