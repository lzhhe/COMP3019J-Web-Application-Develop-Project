from datetime import datetime
from functools import wraps

from flask import Blueprint, render_template, request, redirect, session, url_for, g, abort
from sqlalchemy import or_, desc, asc
from werkzeug.security import generate_password_hash, check_password_hash
import requests

from .forms import RegisterForm, LoginForm, FindForm
from .models import *
from .views import session_required

admin = Blueprint('cal_a', __name__, url_prefix="/admin")  # cal_u is name of blueprint


@admin.route('/adminView')
@session_required
def adminView():
    # 获取请求参数
    sort = request.args.get('sort', default='status', type=str)
    order = request.args.get('order', default='asc', type=str)
    search = request.args.get("search", default="", type=str)  # 获取可能存在的搜索参数

    # 确保sort是一个有效的字段
    valid_sort_fields = ['status', 'gender', 'grade']
    if sort not in valid_sort_fields:
        abort(400, description="Invalid sort field")

    # 构建查询条件
    conditions = [or_(User.status == 1, User.status == 2)]

    # 如果存在搜索参数，构建搜索条件
    if search:
        search_conditions = []

        # 对于性别
        gender_map = {"none": 0, "male": 1, "female": 2}
        if search in gender_map:
            search_conditions.append(User.gender == gender_map[search])

        # 对于身份
        status_map = {"student": 1, "teacher": 2}
        if search in status_map:
            search_conditions.append(User.status == status_map[search])

        # 对于年级
        if search.isdigit() and int(search) in [1, 2, 3, 4]:
            search_conditions.append(User.grade == int(search))

        # 对于用户名和邮箱
        search_conditions.append(User.username.contains(search))
        search_conditions.append(User.email.contains(search))

        # 结合搜索条件
        conditions.append(or_(*search_conditions))

    # 构造基本查询
    query = User.query.filter(*conditions)

    # 动态排序
    order_func = desc if order == 'desc' else asc
    query = query.order_by(order_func(getattr(User, sort)))

    users = query.all()

    return render_template('adminView.html', users=users, current_sort=sort, current_order=order)


@admin.route('/searchThing')
def searchThing():
    search = request.args.get("search")

    # 定义条件映射
    conditions = []

    # 对于性别
    gender_map = {
        "none": 0,
        "male": 1,
        "female": 2
    }
    if search in gender_map:
        conditions.append(User.gender == gender_map[search])

    # 对于身份
    status_map = {
        "student": 1,
        "teacher": 2
    }
    if search in status_map:
        conditions.append(User.status == status_map[search])

    # 对于年级
    if search.isdigit() and int(search) in [1, 2, 3, 4]:
        conditions.append(User.grade == int(search))

    # 对于用户名和邮箱的查询
    conditions.append(User.username.contains(search))
    conditions.append(User.email.contains(search))

    # 最终组合条件
    final_conditions = or_(*conditions) & (User.status != 0)

    users = User.query.filter(final_conditions).all()

    return render_template('adminView.html', users=users, current_sort='status', current_order='asc')


@admin.route('/logout')
def logout():
    session.pop('uid')
    response = redirect('main')
    return response
