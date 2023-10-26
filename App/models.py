from .extents import db


class User(db.Model):
    __tablename__ = 'user'
    UID = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(30), unique=True, nullable=False)
    password = db.Column(db.String(30), nullable=False)
    status = db.Column(db.Integer, nullable=False, default=1)
    email = db.Column(db.String(30), nullable=False)
    grade = db.Column(db.Integer, nullable=False)
    gender = db.Column(db.Integer, nullable=False)
