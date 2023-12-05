from datetime import datetime
from functools import wraps

from flask import Blueprint, render_template, request, redirect, session, url_for, g, app, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
import requests

from .forms import RegisterForm, LoginForm, FindForm, ChangeInfo, AddEvent, UpdateEvent, UpdateSchedule
from .forms import RegisterForm, LoginForm, FindForm, ChangeInfo, AddEvent, AddSchedule
from .models import *

blue = Blueprint('cal_u', __name__)  # cal_u is name of blueprint


@blue.route('/')
@blue.route('/main')
def main():
    return render_template('base.html')


@blue.route('/draw')
def draw():
    return render_template('draw.html')


@blue.route('/todo')
def todo():
    return render_template('todo.html')


def session_required(fn):
    @wraps(fn)
    def inner(*args, **kwargs):
        if g.user:
            return fn(*args, **kwargs)
        else:
            return redirect('loginPage')

    return inner


@blue.route('/weekView')
@session_required
def weekView():
    # uid = request.cookies.get('uid')
    user = g.user
    session['last_page'] = 'weekView'
    if user.status == 1:
        schedules = Schedule.query.filter_by(username=user.username).all()
        deadlines = Deadline.query.filter_by(targetUsername=user.username).all()
        return render_template('viewWeek.html', schedules=schedules, deadlines=deadlines)
    elif user.status == 2:
        response = redirect(url_for('cal_t.teacherView'))
    else:
        response = redirect(url_for('cal_a.adminView'))
    return response


@blue.route('/addSchedule', methods=['GET', 'POST'])
def addSchedule():
    if request.method == 'GET':
        return redirect(url_for('cal_u.weekView'))
    else:
        form = AddSchedule(request.form)

        if form.validate():

            username = g.user.username
            date = form.date.data
            title = form.title.data
            content = form.content.data
            startTime = form.startTime.data
            endTime = form.endTime.data
            color = form.color.data

            if startTime is None:  # deadline
                deadline = Deadline(username=username, targetUsername=username, deadlineTitle=title, content=content,
                                    date=date,
                                    endTime=endTime, color=color)
                db.session.add(deadline)
                db.session.commit()
                new_deadline = {
                    "id": deadline.DID,
                    "title": deadline.deadlineTitle,
                    "targetUsername": deadline.targetUsername,
                    "content": deadline.content,
                    "date": deadline.date.isoformat(),
                    "endTime": deadline.endTime.isoformat(),
                    "color": deadline.color
                }
                return jsonify(new_deadline)
            else:
                schedule = Schedule(username=username, scheduleTitle=title, content=content, date=date,
                                    startTime=startTime, endTime=endTime, color=color)
                db.session.add(schedule)
                db.session.commit()

                new_schedule = {
                    "id": schedule.SID,
                    "title": schedule.scheduleTitle,
                    "content": schedule.content,
                    "date": schedule.date.isoformat(),
                    "startTime": schedule.startTime.isoformat(),
                    "endTime": schedule.endTime.isoformat(),
                    "color": schedule.color
                }
                return jsonify(new_schedule)

        else:
            # 如果表单验证失败，返回错误信息
            return jsonify({'status': 'error', 'message': 'The schedule may have some problems'}), 400


@blue.route('/updateSchedule', methods=['PUT'])
def updateSchedule():
    form = UpdateSchedule(request.form)
    if form.validate():
        sid = form.sid.data
        schedule = Schedule.query.get(sid)
        if schedule:
            schedule.scheduleTitle = form.title.data
            schedule.content = form.content.data
            schedule.date = form.date.data
            schedule.startTime = form.startTime.data
            schedule.endTime = form.endTime.data
            schedule.color = form.color.data

            db.session.commit()
            update_schedule = {
                "id": schedule.SID,
                "title": schedule.scheduleTitle,
                "content": schedule.content,
                "date": schedule.date.isoformat(),
                "startTime": schedule.startTime.isoformat(),
                "endTime": schedule.endTime.isoformat(),
                "color": schedule.color
            }
            return jsonify(update_schedule)
        else:
            print(333)
            return jsonify({'status': 'error', 'message': 'schedule not found'}), 404
    else:
        print(444)
        return jsonify({'status': 'error', 'message': 'Invalid data'}), 400


@blue.route('/monthView')
@session_required
def monthView():
    # uid = request.cookies.get('uid')
    user = g.user
    session['last_page'] = 'monthView'
    if user.status == 1:
        events = Event.query.filter_by(username=user.username).all()
        return render_template('viewMonth.html', events=events)
    elif user.status == 2:
        response = redirect(url_for('cal_t.teacherView'))
    else:
        response = redirect(url_for('cal_a.adminView'))
    return response


@blue.route('/addEvent', methods=['GET', 'POST'])
def addEvent():
    if request.method == 'GET':
        return redirect(url_for('cal_u.monthView'))
    else:
        form = AddEvent(request.form)
        if form.validate():
            username = g.user.username
            title = form.title.data
            content = form.content.data
            startDate = form.startDate.data
            endDate = form.endDate.data
            color = form.color.data
            event = Event(username=username, eventTitle=title, content=content,
                          startDate=startDate, endDate=endDate, color=color)
            db.session.add(event)
            db.session.commit()

            new_event = {
                "id": event.EID,
                "title": event.eventTitle,
                "startDate": event.startDate.isoformat(),
                "endDate": event.endDate.isoformat(),
                "content": event.content,
                "color": event.color
            }
            return jsonify(new_event)

        else:
            # 如果表单验证失败，返回错误信息
            return jsonify({'status': 'error', 'message': 'The event may have some problems'}), 400


@blue.route('/updateEvent', methods=['PUT'])
def updateEvent():
    form = UpdateEvent(request.form)
    if form.validate():
        eid = form.eid.data
        event = Event.query.get(eid)
        if event:
            event.eventTitle = form.title.data
            event.content = form.content.data
            event.startDate = form.startDate.data
            event.endDate = form.endDate.data
            event.color = form.color.data

            db.session.commit()
            update_event = {
                "id": event.EID,
                "title": event.eventTitle,
                "startDate": event.startDate.isoformat(),
                "endDate": event.endDate.isoformat(),
                "content": event.content,
                "color": event.color
            }
            return jsonify(update_event)
        else:
            return jsonify({'status': 'error', 'message': 'Event not found'}), 404
    else:
        return jsonify({'status': 'error', 'message': 'Invalid data'}), 400


@blue.route('/deleteEvent', methods=['DELETE'])
def deleteEvent():
    eid = request.args.get('eid')  # 或使用 request.json.get('eid') 如果你发送 JSON
    event = Event.query.get(eid)
    try:
        db.session.delete(event)
        db.session.commit()
        return jsonify(eid)
    except Exception as e:
        print('e:', e)
        return jsonify({'code': 500, 'msg': 'Error deleting event'})


@blue.route('/yearView')
@session_required
def yearView():
    # uid = request.cookies.get('uid')
    user = g.user
    session['last_page'] = 'yearView'
    if user.status == 1:
        return render_template('viewYear.html')
    elif user.status == 2:
        response = redirect(url_for('cal_t.teacherView'))
    else:
        response = redirect(url_for('cal_a.adminView'))
    return response


@blue.route('/loginPage', methods=['GET', 'POST'])  # 这是默认访问路径
def loginPage():
    if request.method == 'GET':
        return render_template('loginMix.html')


@blue.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'GET':
        return render_template('loginMix.html')
    elif request.method == 'POST':
        form = LoginForm(request.form)
        if form.validate():
            username = form.signInUsernameField.data  # 修改这里
            password = form.signInPasswordField.data  # 修改这里
            user = User.query.filter_by(username=username).first()
            if check_password_hash(user.password, password):
                if user.status == 1:
                    response = redirect('/weekView')
                elif user.status == 2:
                    response = redirect(url_for('cal_t.teacherView'))
                else:
                    response = redirect(url_for('cal_a.adminView'))
                session['uid'] = user.UID
                return response
            else:
                return render_template('loginMix.html', errors="the password is wrong")
        else:
            return render_template('loginMix.html', errors=form.errors)


@blue.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'GET':
        return render_template('loginMix.html')
    elif request.method == 'POST':
        form = RegisterForm(request.form)
        if form.validate():
            email = form.signUpEmailField.data  # 修改这里
            username = form.signUpUsernameField.data  # 修改这里
            password = form.signUpPasswordField.data  # 修改这里
            user = User(email=email, username=username, password=generate_password_hash(password))
            db.session.add(user)
            db.session.commit()

            response = redirect('/weekView')
            session['uid'] = user.UID
            return response
        else:
            print(form.errors)
            return render_template('loginMix.html', errors=form.errors)


@blue.route('/find_password', methods=['GET', 'POST'])
def find_password():
    if request.method == 'GET':
        return render_template('loginMix.html')
    elif request.method == 'POST':
        form = FindForm(request.form)
        if form.validate():
            username = form.find_uname.data
            email = form.find_email.data
            password = form.find_password.data
            user = User.query.filter_by(username=username).first()
            if email == user.email:
                user.password = generate_password_hash(password)
                db.session.commit()
                response = redirect('/weekView')
                session['uid'] = user.UID
                return response
            else:
                return render_template('loginMix.html', errors="the email is wrong")
        else:  # 用户不存在
            print(form.errors)
            return render_template('loginMix.html', errors=form.errors)


@blue.route('/changeInfor', methods=['GET', 'POST'])
def changeInfor():
    if request.method == 'GET':
        return redirect('/weekView')
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

            return redirect(url_for('cal_u.weekView'))
        else:
            return redirect(url_for('cal_u.weekView', error="the username has existed"))


@blue.route('/logout')
def logout():
    session.pop('uid')
    response = redirect('main')
    return response

#
