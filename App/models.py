from datetime import datetime, date

from .extents import db


class User(db.Model):
    __tablename__ = 'user'
    UID = db.Column(db.Integer, primary_key=True, autoincrement=True)  # id唯一
    username = db.Column(db.String(30), unique=True, nullable=False)  # 用户名
    password = db.Column(db.String(256), nullable=False)  # 密码
    status = db.Column(db.Integer, nullable=False, default=1)  # 0是管理员，1是学生，2是老师
    email = db.Column(db.String(30), nullable=False)  # 邮箱
    grade = db.Column(db.Integer, nullable=False, default=0)  # 年级 0，1，2，3，4
    gender = db.Column(db.Integer, nullable=False, default=0)  # gender male 1，female 2 . 0默认
    color = db.Column(db.Integer, nullable=False, default=0)  # 0是light，1是dark


class Event(db.Model):
    __tablename__ = 'event'
    EID = db.Column(db.Integer, primary_key=True, autoincrement=True)
    username = db.Column(db.String(255), db.ForeignKey('user.username'))  # who create this event
    eventTitle = db.Column(db.String(256), nullable=False)
    content = db.Column(db.Text)
    startDate = db.Column(db.Date, nullable=False)
    endDate = db.Column(db.Date, nullable=False)
    color = db.Column(db.Integer, nullable=False)


class Schedule(db.Model):
    __tablename__ = 'schedule'
    SID = db.Column(db.Integer, primary_key=True, autoincrement=True)
    username = db.Column(db.String(255), db.ForeignKey('user.username'))  # who create this event
    scheduleTitle = db.Column(db.String(256), nullable=False)
    content = db.Column(db.Text)
    date = db.Column(db.Date, nullable=False)
    startTime = db.Column(db.Time, nullable=False)
    endTime = db.Column(db.Time, nullable=False)
    color = db.Column(db.Integer, nullable=False)


class Deadline(db.Model):
    __tablename__ = 'deadline'
    DID = db.Column(db.Integer, primary_key=True, autoincrement=True)
    username = db.Column(db.String(255), db.ForeignKey('user.username'))  # who create this event
    targetUsername = db.Column(db.String(255), db.ForeignKey('user.username'))  # who will receive this deadline
    date = db.Column(db.Date, nullable=False)
    deadlineTitle = db.Column(db.String(256), nullable=False)
    content = db.Column(db.Text)
    endTime = db.Column(db.Time, nullable=False)
    color = db.Column(db.Integer, nullable=False)


class Log(db.Model):
    __tablename__ = 'log'
    LID = db.Column(db.Integer, primary_key=True, autoincrement=True)
    logContent = db.Column(db.Text)
    time = db.Column(db.DateTime, nullable=False, default=datetime.now())
    logType = db.Column(db.Integer, nullable=False, default=0)  # 0 information，1 warning，2 error
