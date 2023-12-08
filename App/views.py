from datetime import datetime
from functools import wraps

from flask import Blueprint, render_template, request, redirect, session, url_for, g, app, jsonify
from sqlalchemy import and_, or_
from werkzeug.security import generate_password_hash, check_password_hash
import requests

from .forms import RegisterForm, LoginForm, FindForm, ChangeInfo, AddEvent, UpdateEvent, UpdateSchedule, UpdateDeadline
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
    view_type = request.args.get('type', 'all')  # 默认值为 'week'
    if user.status == 1:
        if view_type == 'all':
            schedules = Schedule.query.filter_by(username=user.username).all()
            deadlines = Deadline.query.filter_by(targetUsername=user.username).all()
            return render_template('viewWeek.html', schedules=schedules, deadlines=deadlines)
        elif view_type == 'schedule':
            schedules = Schedule.query.filter_by(username=user.username).all()
            return render_template('viewWeek.html', schedules=schedules, deadlines='')
        elif view_type == 'ddl':
            deadlines = Deadline.query.filter_by(targetUsername=user.username).all()
            return render_template('viewWeek.html', schedules='', deadlines=deadlines)
        elif view_type == 'teacherddl':
            deadlines = Deadline.query.filter(
                and_(
                    Deadline.targetUsername == user.username,
                    Deadline.username != user.username
                )
            ).all()
            return render_template('viewWeek.html', schedules='', deadlines=deadlines)

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
        username = g.user.username
        if form.validate():

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

                log_message = f"Deadline added: {title}, for {username} on {date}, ends at {endTime}"
                log_entry = Log(logContent=log_message, logType=0)
                db.session.add(log_entry)
                db.session.commit()
                return jsonify(new_deadline)
            else:
                schedule = Schedule(username=username, scheduleTitle=title, content=content, date=date,
                                    startTime=startTime, endTime=endTime, color=color)

                new_schedule = {
                    "id": schedule.SID,
                    "title": schedule.scheduleTitle,
                    "content": schedule.content,
                    "date": schedule.date.isoformat(),
                    "startTime": schedule.startTime.isoformat(),
                    "endTime": schedule.endTime.isoformat(),
                    "color": schedule.color
                }

                overlapping_schedules = Schedule.query.filter(
                    Schedule.username == username,
                    Schedule.date == date,
                    or_(
                        and_(Schedule.startTime <= startTime, Schedule.endTime >= startTime),
                        and_(Schedule.startTime <= endTime, Schedule.endTime >= endTime),
                    )
                ).all()

                if overlapping_schedules:
                    log_message = f"Schedule added with overlapping: Overlapping schedule found for {username} on {date}, from {startTime} to {endTime}"
                    log_entry = Log(logContent=log_message, logType=1)
                    db.session.add(log_entry)
                    db.session.commit()
                else:
                    log_message = f"Schedule added: {title}, for {username} on {date}, from {startTime} to {endTime}"
                    log_entry = Log(logContent=log_message, logType=0)
                    db.session.add(log_entry)
                    db.session.commit()

                db.session.add(schedule)
                db.session.commit()


                return jsonify(new_schedule)

        else:
            log_message = f"Failed to add schedule/deadline for {g.user.username}. Form validation failed."
            log_entry = Log(logContent=log_message, logType=2)
            db.session.add(log_entry)
            db.session.commit()
            return jsonify({'status': 'error', 'message': 'The schedule/deadline may have some problems'}), 400


@blue.route('/updateSchedule', methods=['PUT'])
def updateSchedule():
    form = UpdateSchedule(request.form)
    username = g.user.username
    if form.validate():
        sid = form.sid.data
        schedule = Schedule.query.get(sid)
        if schedule:
            overlapping_schedules = Schedule.query.filter(
                Schedule.SID != sid,  # Exclude the current schedule from the check
                Schedule.username == schedule.username,  # Assuming username is a field in Schedule
                Schedule.date == form.date.data,
                or_(
                    and_(Schedule.startTime <= form.startTime.data, Schedule.endTime >= form.startTime.data),
                    and_(Schedule.startTime <= form.endTime.data, Schedule.endTime >= form.endTime.data),
                )
            ).all()

            # Update schedule
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

            if overlapping_schedules:
                log_type = 1  # Overlap found
                log_message = f"User {username} updated schedule with overlap: {schedule.scheduleTitle}, ID: {sid}"
            else:
                log_type = 2  # No overlap
                log_message = f"User {username} successfully updated schedule without overlap: {schedule.scheduleTitle}, ID: {sid}"

            log_entry = Log(logContent=log_message, logType=log_type)
            db.session.add(log_entry)
            db.session.commit()

            return jsonify(update_schedule)
        else:
            # Log failed update - schedule not found, with username
            log_message = f"User {username} failed to update schedule: ID {sid} not found"
            log_entry = Log(logContent=log_message, logType=2)
            db.session.add(log_entry)
            db.session.commit()
            return jsonify({'status': 'error', 'message': 'schedule not found'}), 404
    else:
        # Log failed update - invalid data, with username
        log_message = f"User {username} failed to update schedule: Invalid data"
        log_entry = Log(logContent=log_message, logType=2)
        db.session.add(log_entry)
        db.session.commit()
        return jsonify({'status': 'error', 'message': 'Invalid data'}), 400


@blue.route('/deleteSchedule', methods=['DELETE'])
def deleteSchedule():
    sid = request.args.get('sid')  # 或使用 request.json.get('eid') 如果你发送 JSON
    schedule = Schedule.query.get(sid)
    username = g.user.username
    if schedule:
        try:
            db.session.delete(schedule)
            db.session.commit()

            log_message = f"User {username} successfully deleted schedule: ID {sid}"
            log_entry = Log(logContent=log_message, logType=0)
            db.session.add(log_entry)
            db.session.commit()

            return jsonify(sid)
        except Exception as e:

            log_message = f"User {username} failed to delete schedule: ID {sid}, Warning: {e}"
            log_entry = Log(logContent=log_message, logType=1)
            db.session.add(log_entry)
            db.session.commit()

            return jsonify({'code': 500, 'msg': 'Error deleting event'})
    else:
        log_message = f"User {username} failed to delete schedule: ID {sid} not found"
        log_entry = Log(logContent=log_message, logType=2)
        db.session.add(log_entry)
        db.session.commit()

        return jsonify({'code': 404, 'msg': 'Schedule not found'}), 404


@blue.route('/updateDeadline', methods=['PUT'])
def updateDeadline():
    form = UpdateDeadline(request.form)
    username = g.user.username
    if form.validate():
        did = form.did.data
        deadline = Deadline.query.get(did)
        if deadline:
            deadline.deadlineTitle = form.title.data
            deadline.content = form.content.data
            deadline.date = form.date.data
            deadline.endTime = form.endTime.data
            deadline.color = form.color.data

            db.session.commit()
            update_deadline = {
                "id": deadline.DID,
                "title": deadline.deadlineTitle,
                "content": deadline.content,
                "date": deadline.date.isoformat(),
                "endTime": deadline.endTime.isoformat(),
                "color": deadline.color
            }

            log_message = f"User {username} successfully updated deadline: {deadline.deadlineTitle}, ID: {did}"
            log_entry = Log(logContent=log_message, logType=0)
            db.session.add(log_entry)
            db.session.commit()

            return jsonify(update_deadline)
        else:

            log_message = f"User {username} failed to update deadline: ID {did} not found"
            log_entry = Log(logContent=log_message, logType=1)
            db.session.add(log_entry)
            db.session.commit()

            return jsonify({'status': 'error', 'message': 'deadline not found'}), 404
    else:

        log_message = f"User {username} failed to update deadline: Invalid data"
        log_entry = Log(logContent=log_message, logType=2)
        db.session.add(log_entry)
        db.session.commit()

        return jsonify({'status': 'error', 'message': 'Invalid data'}), 400


@blue.route('/deleteDeadline', methods=['DELETE'])
def deleteDeadline():
    did = request.args.get('did')
    deadline = Deadline.query.get(did)
    username = g.user.username
    if deadline:

        try:
            db.session.delete(deadline)
            db.session.commit()

            log_message = f"User {username} successfully deleted deadline: ID {did}"
            log_entry = Log(logContent=log_message, logType=0)
            db.session.add(log_entry)
            db.session.commit()

            return jsonify(did)
        except Exception as e:

            log_message = f"User {username} failed to delete deadline: ID {did}, Warning: {e}"
            log_entry = Log(logContent=log_message, logType=1)
            db.session.add(log_entry)
            db.session.commit()

            return jsonify({'code': 500, 'msg': 'Error deleting deadline'})
    else:
        log_message = f"User {username} failed to delete deadline: ID {did} not found"
        log_entry = Log(logContent=log_message, logType=2)
        db.session.add(log_entry)
        db.session.commit()

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
        username = g.user.username
        if form.validate():
            title = form.title.data
            content = form.content.data
            startDate = form.startDate.data
            endDate = form.endDate.data
            color = form.color.data
            event = Event(username=username, eventTitle=title, content=content,
                          startDate=startDate, endDate=endDate, color=color)
            db.session.add(event)
            db.session.commit()

            log_message = f"User {username} successfully added event: {title}, ID: {event.EID}"
            log_entry = Log(logContent=log_message, logType=0)
            db.session.add(log_entry)
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

            log_message = f"User {username} failed to add event. Form validation failed."
            log_entry = Log(logContent=log_message, logType=2)
            db.session.add(log_entry)
            db.session.commit()

            return jsonify({'status': 'error', 'message': 'The event may have some problems'}), 400


@blue.route('/updateEvent', methods=['PUT'])
def updateEvent():
    form = UpdateEvent(request.form)
    username = g.user.username
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

            log_message = f"User {username} successfully updated event: {event.eventTitle}, ID: {eid}"
            log_entry = Log(logContent=log_message, logType=0)
            db.session.add(log_entry)
            db.session.commit()

            return jsonify(update_event)
        else:

            log_message = f"User {username} failed to update event: ID {eid} not found"
            log_entry = Log(logContent=log_message, logType=1)
            db.session.add(log_entry)
            db.session.commit()

            return jsonify({'status': 'error', 'message': 'Event not found'}), 404
    else:

        log_message = f"User {username} failed to update event: Invalid data"
        log_entry = Log(logContent=log_message, logType=2)
        db.session.add(log_entry)
        db.session.commit()

        return jsonify({'status': 'error', 'message': 'Invalid data'}), 400


@blue.route('/deleteEvent', methods=['DELETE'])
def deleteEvent():
    username = g.user.username
    eid = request.args.get('eid')  # 或使用 request.json.get('eid') 如果你发送 JSON
    event = Event.query.get(eid)
    if event:
        try:
            db.session.delete(event)
            db.session.commit()

            log_message = f"User {username} successfully deleted event: ID {eid}"
            log_entry = Log(logContent=log_message, logType=0)
            db.session.add(log_entry)
            db.session.commit()

            return jsonify(eid)
        except Exception as e:
            log_message = f"User {username} failed to delete event: ID {eid}, Waring: {e}"
            log_entry = Log(logContent=log_message, logType=1)
            db.session.add(log_entry)
            db.session.commit()

            return jsonify({'code': 500, 'msg': 'Error deleting event'})
    else:
        log_message = f"User {username} failed to delete event: ID {eid} not found"
        log_entry = Log(logContent=log_message, logType=2)
        db.session.add(log_entry)
        db.session.commit()


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
            username = form.signInUsernameField.data
            password = form.signInPasswordField.data
            user = User.query.filter_by(username=username).first()

            if user and check_password_hash(user.password, password):
                # Successful login
                if user.status == 1:  # Student
                    response = redirect('/weekView')
                elif user.status == 2:  # Teacher
                    response = redirect(url_for('cal_t.teacherView'))
                else:  # Admin
                    response = redirect(url_for('cal_a.adminView'))

                log_message = f"User {username} logged in as {'student' if user.status == 1 else 'teacher' if user.status == 2 else 'admin'}"
                log_type = 0
                session['uid'] = user.UID
            else:
                # Incorrect username or password
                response = render_template('loginMix.html', errors="Username or password is incorrect")
                log_type = 1
                log_message = f"Failed login attempt for username: {username} Wrong password or username"

            # Log the login attempt
            log_entry = Log(logContent=log_message, logType=log_type)
            db.session.add(log_entry)
            db.session.commit()
            return response

        else:
            # Validation error
            log_message = "Login validation failed"
            log_type = 2
            log_entry = Log(logContent=log_message, logType=log_type)
            db.session.add(log_entry)
            db.session.commit()
            return render_template('loginMix.html', errors=form.errors)



@blue.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'GET':
        return render_template('loginMix.html')
    elif request.method == 'POST':
        form = RegisterForm(request.form)
        if form.validate():
            email = form.signUpEmailField.data
            username = form.signUpUsernameField.data
            password = form.signUpPasswordField.data
            user = User(email=email, username=username, password=generate_password_hash(password))
            db.session.add(user)
            db.session.commit()

            log_message = f"New user {username} successfully registered"
            log_type = 0
            log_entry = Log(logContent=log_message, logType=log_type)
            db.session.add(log_entry)
            db.session.commit()

            response = redirect('/weekView')
            session['uid'] = user.UID
            return response
        else:
            username = form.signUpUsernameField.data
            log_message = "Registration validation failed: " + (f"New user {username} registered failed due to repeat "
                                                                f"username")
            log_type = 2  # Log type for registration error
            log_entry = Log(logContent=log_message, logType=log_type)
            db.session.add(log_entry)
            db.session.commit()

            return render_template('loginMix.html', errors=form.errors)


@blue.route('/find_password', methods=['GET', 'POST'])
def find_password():
    if request.method == 'GET':
        return render_template('loginMix.html')
    elif request.method == 'POST':
        form = FindForm(request.form)
        username = g.user.username
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

                log_message = f"User {username} successfully reset password"
                log_type = 0  # Log type for successful operation
                log_entry = Log(logContent=log_message, logType=log_type)
                db.session.add(log_entry)
                db.session.commit()

                return response
            else:

                log_message = f"Password reset failed for {username}: Email mismatch"
                log_type = 2  # Log type for operation error
                log_entry = Log(logContent=log_message, logType=log_type)
                db.session.add(log_entry)
                db.session.commit()

                return render_template('loginMix.html', errors="the email is wrong")
        else:

            log_message = f"Password reset failed: User {username} not found"
            log_type = 2  # Log type for operation error
            log_entry = Log(logContent=log_message, logType=log_type)
            db.session.add(log_entry)
            db.session.commit()

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
                log_message = f"User {user.username} successfully updated: {', '.join(updated_fields)}"
                log_type = 0  # Log type for successful operation
            else:
                log_message = f"User {user.username} made no changes"
                log_type = 1  # Log type for no change made

            log_entry = Log(logContent=log_message, logType=log_type)
            db.session.add(log_entry)
            db.session.commit()

            return redirect(url_for('cal_u.weekView'))
        else:
            log_message = f"User {g.user.username} information change failed: Form validation error"
            log_type = 2  # Log type for operation error
            log_entry = Log(logContent=log_message, logType=log_type)
            db.session.add(log_entry)
            db.session.commit()

            return redirect(url_for('cal_u.weekView', error="the username has existed"))



@blue.route('/logout')
def logout():
    uid = session.get('uid')
    if uid:
        # Assuming you have a way to retrieve the username from the user ID
        user = User.query.get(uid)
        if user:
            username = user.username
            log_message = f"User {username} logged out"
        else:
            log_message = f"Unknown user (ID: {uid}) logged out"
    else:
        log_message = "User logout attempt with no active session"

    log_type = 0  # Log type for normal operation
    log_entry = Log(logContent=log_message, logType=log_type)
    db.session.add(log_entry)
    db.session.commit()

    # Proceed with logout
    session.pop('uid', None)  # Safely remove 'uid' from session
    response = redirect('main')
    return response


#
