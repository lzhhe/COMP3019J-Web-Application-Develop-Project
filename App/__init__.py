import datetime

from flask import Flask
from .views import blue


def create_app():
    app = Flask(__name__)

    # 注册蓝图
    app.register_blueprint(blueprint=blue)

    app.config['SECRET_KEY'] = 'COMP3019J'
    # app.config['PERMANENT_SESSION_LIFETIME'] = datetime.timedelta(days=7)

    return app
