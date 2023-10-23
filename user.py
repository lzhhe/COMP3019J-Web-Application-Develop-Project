from app import db

class User(db.Model):
    UID = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(30), unique=True, nullable=False)
    password = db.Column(db.String(30), nullable=False)
    status = db.Column(db.Integer, nullable=False, default=1)
    email = db.Column(db.String(30), nullable=False)

    def __init__(self, name, password, email, status=1):
        self.name = name
        self.password = password
        self.email = email
        self.status = status

    @staticmethod
    def get_user_by_id(user_id):
        return User.query.filter_by(UID=user_id).first()
