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
            Deadline.deadlineTitle.contains(search),  # 如果您想包括标题在搜索中
            Deadline.content.contains(search),  # 如果您想包括内容在搜索中
            Deadline.endTime.contains(search),  # 如果您想包括内容在搜索中
            Deadline.date.contains(search)  # 如果您想包括内容在搜索中
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
def searchThing():
    search = request.args.get("search", default="")
    return redirect(url_for('cal_t.teacherView', search=search))


@teacher.route('/addDDL', methods=['GET', 'POST'])
def addDDL():
    if request.method == 'GET':
        return redirect(url_for('cal_t.teacherView'))
    else:
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
            return jsonify({'code': 200, 'message': 'Deadline added successfully'})
        else:
            return jsonify({'code': 400, 'message': 'Form validation failed'}), 400


@teacher.route('/updateDDL', methods=['GET', 'POST'])
def updateDDL():
    if request.method == 'GET':
        return redirect(url_for('cal_t.teacherView'))
    else:
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
                return jsonify({'code': 200, 'message': 'Deadline updated successfully'})
            else:
                return jsonify({'code': 400, 'message': 'Form validation failed'}), 400
        else:
            return jsonify({'code': 400, 'message': 'Form validation failed'}), 400


@teacher.route('/delDDL', methods=['GET', 'POST'])
def delDDL():
    if request.method == 'GET':
        return redirect(url_for('cal_t.teacherView'))
    else:
        did = request.form.get('did')
        ddl = Deadline.query.get(did)
        try:
            db.session.delete(ddl)
            db.session.commit()
        except Exception as e:
            print('e:', e)
        return jsonify({'code': 200, 'msg': 'delete successfully!'})


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
