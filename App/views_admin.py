from datetime import datetime
from functools import wraps

from flask import Blueprint, render_template, request, redirect, session, url_for, g
from sqlalchemy import or_
from werkzeug.security import generate_password_hash, check_password_hash
import requests

from .forms import RegisterForm, LoginForm, FindForm
from .models import *
from .views import session_required

admin = Blueprint('cal_a', __name__, url_prefix="/admin")  # cal_u is name of blueprint


@admin.route('/adminView')
@session_required
def adminView():
    # uid = request.cookies.get('uid')
    user = g.user
    users = User.query.filter(or_(User.status == 1, User.status == 2)).order_by(User.status, User.grade,
                                                                                User.gender).all()

    return render_template('adminView.html', users=users)


@admin.route('/logout')
def logout():
    session.pop('uid')
    response = redirect('main')
    return response
