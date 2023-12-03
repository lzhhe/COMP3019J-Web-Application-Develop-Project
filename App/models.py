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
    username = db.Column(db.String(255), db.ForeignKey('user.username')) # who create this event
    targetUser = db.Column(db.String(255), db.ForeignKey('user.username')) # the target user (like teacher send event to the student)
    eventTitle = db.Column(db.String(256), nullable=False)
    content = db.Column(db.Text)
    startDate = db.Column(db.Date)
    endDate = db.Column(db.Date, nullable=False)
    startTime = db.Column(db.Time)
    endTime = db.Column(db.Time,nullable=False)
    color = db.Column(db.Integer, nullable=False)
    eventStatus = db.Column(db.Integer, nullable=False)  # 0 Event 1 DDL
    userStatus = db.Column(db.Integer, nullable=False)  # 0 event from student 1 event from teacher

    @property
    def durationDate(self):
        if self.startDate and self.endDate:
            return self.endDate - self.startDate
        else:
            return None

    @property
    def durationTime(self):
        if self.startTime and self.endTime:
            return datetime.combine(date.min, self.endTime) - datetime.combine(date.min, self.startTime)
        else:
            return None