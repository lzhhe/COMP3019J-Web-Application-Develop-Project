from datetime import datetime
from functools import wraps

from flask import Blueprint, render_template, request, redirect, session, url_for, g, abort, jsonify
from sqlalchemy import or_, desc, asc
from werkzeug.security import generate_password_hash, check_password_hash
import csv
import os


from .forms import RegisterForm, LoginForm, FindForm, AddInfo, ChangeInfo
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
    error = request.args.get('error', default="", type=str)

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
    page = request.args.get('page', default=1, type=int)  # 默认为第一页
    per_page = request.args.get('per_page', default=8, type=int)  # 默认每页8条记录
    # 使用paginate()方法
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    users = pagination.items

    return render_template('adminView.html', users=users, current_sort=sort, current_order=order, pagination=pagination
                           , errors=error, current_page=page, per_page=per_page)


@admin.route('/searchThing')
def searchThing():
    search = request.args.get("search")
    return redirect(url_for('cal_a.adminView', search=search))


@admin.route('/adminLogs')
def adminLogs():
    # 获取请求参数
    sort = request.args.get('sort', default='time', type=str)  # 默认排序字段为时间
    order = request.args.get('order', default='asc', type=str)  # 默认排序顺序为升序

    # 确保sort是一个有效的字段
    valid_sort_fields = ['time', 'logType']  # 假设可排序字段为时间和类型
    if sort not in valid_sort_fields:
        abort(400, description="Invalid sort field")

    # 动态排序
    order_func = desc if order == 'desc' else asc
    query = Log.query.order_by(order_func(getattr(Log, sort)))  # 假设日志模型为Log

    # 分页处理
    page = request.args.get('page', default=1, type=int)
    per_page = request.args.get('per_page', default=12, type=int)  # 默认每页10条记录
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    logs = pagination.items

    generate_csv_files()

    return render_template('adminLogs.html', logs=logs, current_sort=sort, current_order=order, pagination=pagination,
                           current_page=page, per_page=per_page)

def generate_csv_files():
    # 从数据库中获取所有日志记录
    all_logs = Log.query.all()

    # 分别创建information, warning, error类型的CSV文件
    create_csv_for_type(all_logs, 0, 'information_logs.csv')  # 0 表示information
    create_csv_for_type(all_logs, 1, 'warning_logs.csv')     # 1 表示warning
    create_csv_for_type(all_logs, 2, 'error_logs.csv')       # 2 表示error

def create_csv_for_type(logs, log_type, filename):
    filtered_logs = [log for log in logs if log.logType == log_type]

    # 保存到CSV文件
    save_logs_to_csv(filename, filtered_logs)

def save_logs_to_csv(filename, logs):
    # 确定要写入的字段
    fieldnames = ['LID', 'time', 'logType', 'logContent']  # 根据您的Log模型进行更新

    # 创建CSV文件并写入数据
    with open(filename, mode='w', newline='', encoding='utf-8') as file:
        writer = csv.DictWriter(file, fieldnames=fieldnames)
        writer.writeheader()
        for log in logs:
            # 格式化时间字段
            log_dict = {fieldname: getattr(log, fieldname) for fieldname in fieldnames}
            log_dict['time'] = log_dict['time'].strftime("%Y-%m-%d %H:%M:%S") if log_dict['time'] else ''
            writer.writerow(log_dict)

@admin.route('/addInfor', methods=['GET', 'POST'])
def addInfor():
    if request.method == 'GET':
        return redirect('/adminView')
    else:
        form = AddInfo(request.form)
        if form.validate():
            username = form.add_new_username.data
            password = form.add_new_password.data
            email = form.add_new_email.data
            gender = form.add_choose_gender.data
            status = form.add_choose_status.data
            grade = form.add_choose_grade.data
            user = User(username=username, email=email, password=generate_password_hash(password), gender=gender,
                        status=status, grade=grade)
            db.session.add(user)
            db.session.commit()

            return redirect(url_for('cal_a.adminView'))
        else:
            return redirect(url_for('cal_a.adminView', error="the username has existed"))


@admin.route('/changeInfor', methods=['GET', 'POST'])
def changeInfor():
    if request.method == 'GET':
        return redirect('/adminView')
    else:
        form = ChangeInfo(request.form)
        if form.validate():
            uid = form.user_uid.data
            if uid:
                user = User.query.get(uid)
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

                return redirect(url_for('cal_a.adminView'))
            else:
                return redirect(url_for('cal_a.adminView', error="admin cannot change"))
        else:
            return redirect(url_for('cal_a.adminView', error="the username has existed"))


@admin.route('/delInfor', methods=['GET', 'POST'])
def delInfor():
    if request.method == 'GET':
        return redirect('/adminView')
    else:
        uid = request.form.get('id')
        user = User.query.get(uid)
        try:
            Schedule.query.filter_by(username=user.username).delete()
            Event.query.filter_by(username=user.username).delete()
            Deadline.query.filter_by(username=user.username).delete()
            Deadline.query.filter_by(targetUsername=user.username).delete()
            db.session.delete(user)
            db.session.commit()
        except Exception as e:
            print('e:', e)
        return jsonify({'code': 200, 'msg': 'delete successfully!'})


@admin.route('/logout')
def logout():
    session.pop('uid')
    response = redirect('main')
    return response
