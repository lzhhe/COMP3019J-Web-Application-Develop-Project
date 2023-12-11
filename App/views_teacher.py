from datetime import datetime
from functools import wraps

from flask import Blueprint, render_template, request, redirect, session, url_for, g, abort, jsonify
from sqlalchemy import or_, and_, desc, asc, func, extract
from werkzeug.security import generate_password_hash, check_password_hash
import requests

from .forms import RegisterForm, LoginForm, FindForm, ChangeInfo, AddSchedule, UpdateDeadline
from .models import *

teacher = Blueprint('cal_t', __name__, url_prefix="/teacher")  # cal_u is name of blueprint


@teacher.route('/teacherView')
def teacherView():
    user = g.user
    sort = request.args.get('sort', default='date', type=str)
    order = request.args.get('order', default='asc', type=str)
    search = request.args.get("search", default="", type=str)

    # 确保排序字段有效
    valid_sort_fields = ['date', 'color']
    if sort not in valid_sort_fields:
        abort(400, description="Invalid sort field")

    # 构建基本查询条件
    conditions = [Deadline.username == user.username]

    # 处理搜索条件
    if search:
        search_conditions = [
            Deadline.targetUsername.contains(search),
            Deadline.deadlineTitle.contains(search),
            Deadline.content.contains(search),
            Deadline.endTime.contains(search),
            Deadline.date.contains(search)
        ]
        conditions.append(or_(*search_conditions))

    # 构建查询
    query = Deadline.query.filter(*conditions)

    # 排序
    if sort and order:
        order_func = desc if order == 'desc' else asc
        query = query.order_by(order_func(getattr(Deadline, sort)))

    # 分页处理
    page = request.args.get('page', default=1, type=int)
    per_page = request.args.get('per_page', default=8, type=int)
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    deadlines = pagination.items

    return render_template('teacherView.html', deadlines=deadlines, current_sort=sort, current_order=order,
                           pagination=pagination, current_page=page, per_page=per_page)


@teacher.route('/searchThing')
def searchThing():# 搜索学生
    search = request.args.get("search", default="")
    return redirect(url_for('cal_t.teacherView', search=search))


@teacher.route('/addDDL', methods=['GET', 'POST'])
def addDDL():
    if request.method == 'GET':
        return redirect(url_for('cal_t.teacherView'))
    else:
        # 一样的逻辑但是不同的是老师的ddl不能被学生删除或者更改
        # 教师会根据自身的年级给同年级的学生添加ddl
        form = AddSchedule(request.form)
        if form.validate():
            username = g.user.username
            date = form.date.data
            title = form.title.data
            content = form.content.data
            endTime = form.endTime.data
            color = form.color.data
            users = User.query.filter(User.status == 1, User.grade == g.user.grade).all()
            for user in users:

                deadline = Deadline(username=username, targetUsername=user.username, deadlineTitle=title,
                                    content=content,
                                    date=date, endTime=endTime, color=color)
                db.session.add(deadline)
                db.session.commit()

                overlapping_schedules = Schedule.query.filter(
                    Schedule.username == user.username,
                    Schedule.date == date,
                    Schedule.startTime < endTime,
                    endTime < Schedule.endTime
                ).all()

                # 一样的逻辑如果加在学生自己的设置的时间的中间，会给管理员一个告警，但是仍然可以正常添加
                if overlapping_schedules:
                    log_message = f"Teacher deadline add may overlap with existing schedules for {username} on {date}, from {overlapping_schedules[0].startTime} to {overlapping_schedules[0].endTime}"
                    log_entry = Log(logContent=log_message, logType=1)
                    db.session.add(log_entry)
                    db.session.commit()
                else:
                    log_message = f"Teacher deadline added: {title}, for {username} on {date} at {endTime}"
                    log_entry = Log(logContent=log_message, logType=0)
                    db.session.add(log_entry)
                    db.session.commit()

            return jsonify({'code': 200, 'message': 'Deadline added successfully'})
        else:

            log_message = f"Failed to add teacher deadline: Form validation failed for {g.user.username}"
            log_type = 2  # Error for validation failure
            log_entry = Log(logContent=log_message, logType=log_type)
            db.session.add(log_entry)
            db.session.commit()

            return jsonify({'code': 400, 'message': 'Form validation failed'}), 400


@teacher.route('/updateDDL', methods=['GET', 'POST'])
def updateDDL():
    if request.method == 'GET':
        return redirect(url_for('cal_t.teacherView'))
    else:
        # 一样的逻辑
        form = UpdateDeadline(request.form)
        if form.validate():
            did = form.did.data
            ddl = Deadline.query.get(did)
            if ddl:
                ddl.deadlineTitle = form.title.data
                ddl.date = form.date.data
                ddl.endTime = form.endTime.data
                ddl.content = form.content.data
                ddl.color = form.color.data

                db.session.commit()

                # Check for overlapping schedules
                overlapping_schedules = Schedule.query.filter(
                    Schedule.username == ddl.targetUsername,
                    Schedule.date == ddl.date,
                    Schedule.startTime < ddl.endTime,
                    ddl.endTime < Schedule.endTime
                ).all()

                if overlapping_schedules:
                    log_message = f"Teacher deadline update may overlap with existing schedules for {ddl.targetUsername} on {ddl.date}, from {overlapping_schedules[0].startTime} to {overlapping_schedules[0].endTime}"
                    log_type = 1  # Log type for warning
                else:
                    log_message = f"Teacher deadline added: {ddl.title}, for {ddl.targetUsername} on {ddl.date} at {ddl.endTime}"
                    log_type = 0  # Log type for successful operation

                log_entry = Log(logContent=log_message, logType=log_type)
                db.session.add(log_entry)
                db.session.commit()

                return jsonify({'code': 200, 'message': 'Deadline updated successfully'})
            else:

                log_message = f"Deadline update failed: Deadline with ID {did} not found"
                log_type = 2  # Error for not found
                log_entry = Log(logContent=log_message, logType=log_type)
                db.session.add(log_entry)
                db.session.commit()

                return jsonify({'code': 400, 'message': 'Deadline not found'}), 400
        else:

            log_message = "Deadline update failed: Form validation error"
            log_type = 2  # Error for validation failure
            log_entry = Log(logContent=log_message, logType=log_type)
            db.session.add(log_entry)
            db.session.commit()

            return jsonify({'code': 400, 'message': 'Form validation failed'}), 400


@teacher.route('/delDDL', methods=['GET', 'POST'])
def delDDL():
    if request.method == 'GET':
        return redirect(url_for('cal_t.teacherView'))
    else:
        did = request.form.get('did')
        ddl = Deadline.query.get(did)
        if ddl:
            try:
                db.session.delete(ddl)
                db.session.commit()

                # Log successful deletion
                log_message = f"Teacher successfully deleted deadline: ID {did}"
                log_type = 0  # Log type for successful operation
                log_entry = Log(logContent=log_message, logType=log_type)
                db.session.add(log_entry)
                db.session.commit()

                return jsonify({'code': 200, 'msg': 'delete successfully!'})
            except Exception as e:
                # Log exception during deletion
                log_message = f"Error deleting deadline: ID {did}, Error: {e}"
                log_type = 2  # Log type for error
                log_entry = Log(logContent=log_message, logType=log_type)
                db.session.add(log_entry)
                db.session.commit()

                return jsonify({'code': 500, 'msg': 'Error deleting deadline'})
        else:
            # Log if deadline not found
            log_message = f"Delete failed: Deadline with ID {did} not found"
            log_type = 2  # Log type for error
            log_entry = Log(logContent=log_message, logType=log_type)
            db.session.add(log_entry)
            db.session.commit()

            return jsonify({'code': 400, 'msg': 'Deadline not found'}), 400


@teacher.route('/changeInfor', methods=['GET', 'POST'])
def changeInfor():
    if request.method == 'GET':
        return redirect('/teacherView')
    else:
        # 改变用户信息  与学生一样
        form = ChangeInfo(request.form)
        if form.validate():
            user = g.user
            password = form.new_password.data
            gender = form.choose_gender.data
            grade = form.choose_grade.data
            updated_fields = []

            if password:
                user.password = generate_password_hash(password)
                updated_fields.append("password")
            if gender:
                user.gender = gender
                updated_fields.append("gender")
            if grade:
                user.grade = grade
                updated_fields.append("grade")

            if updated_fields:
                db.session.commit()
                log_message = f"Teacher {user.username} successfully updated: {', '.join(updated_fields)}"
                log_type = 0  # Log type for successful operation
            else:
                log_message = f"Teacher {user.username} made no changes"
                log_type = 1  # Log type for no change made

            log_entry = Log(logContent=log_message, logType=log_type)
            db.session.add(log_entry)
            db.session.commit()

            return redirect(url_for('cal_t.teacherView'))
        else:
            # Log form validation failure
            log_message = f"Teacher {g.user.username} information change failed: Form validation error"
            log_type = 2  # Log type for operation error
            log_entry = Log(logContent=log_message, logType=log_type)
            db.session.add(log_entry)
            db.session.commit()

            return redirect(url_for('cal_t.teacherView', error="the username has existed"))
