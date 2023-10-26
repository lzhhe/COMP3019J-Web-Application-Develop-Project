import datetime

from flask import Flask
from .views import blue
from .extents import init_exts

HOSTNAME = "127.0.0.1"
PORT = 3306
USERNAME = "root"
PASSWORD = "123456"
FLASK_DB = "calendar_web"


def create_app():
    app = Flask(__name__)

    # 注册蓝图
    app.register_blueprint(blueprint=blue)

    app.config['SECRET_KEY'] = 'COMP3019J'
    # app.config['PERMANENT_SESSION_LIFETIME'] = datetime.timedelta(days=7)

    db_uri = f'mysql+pymysql://{USERNAME}:{PASSWORD}@localhost:{PORT}/{FLASK_DB}?charset=utf8mb4'
    app.config['SQLALCHEMY_DATABASE_URI'] = db_uri
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    init_exts(app)

    return app
