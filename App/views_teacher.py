from datetime import datetime
from functools import wraps

from flask import Blueprint, render_template, request, redirect, session, url_for, g
from werkzeug.security import generate_password_hash, check_password_hash
import requests

from .forms import RegisterForm, LoginForm, FindForm
from .models import *

teacher = Blueprint('cal_t', __name__, url_prefix="/teacher")  # cal_u is name of blueprint


@teacher.route('/teacherView')
def teacherView():
    # uid = request.cookies.get('uid')
    user = g.user
    return render_template('viewYear.html')


@teacher.route('/logout')
def logout():
    session.pop('uid')
    response = redirect('main')
    return response
