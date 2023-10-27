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
