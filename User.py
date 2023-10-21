from app import db

class User(db.Model):
    UID = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(30), unique=True, nullable=False)
    password = db.Column(db.String(30), nullable=False)
    status = db.Column(db.Integer, nullable=False)
    email = db.Column(db.String(30), nullable=False)

    def __init__(self, UID, name, password, email, status=1):
        self.UID = UID
        self.name = name
        self.password = password
        self.email = email
        self.status = status

    @property
    def get_UID(self):
        return self.UID

    @property
    def get_name(self):
        return self.name

    @property
    def get_password(self):
        return self.password

    @property
    def get_status(self):
        return self.status

    @property
    def get_email(self):
        return self.email
