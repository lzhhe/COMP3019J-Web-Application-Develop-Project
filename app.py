from flask import session, g

from App import create_app  # 第一次执行这个，然后执行蓝图，就执行到了views，再然后是数据库，最后执行到首页，然后再是create_app
from App.models import User

app = create_app()


@app.before_request
def my_before():
    uid = session.get('uid')
    if uid:
        user = User.query.get(uid)
        setattr(g, 'user', user)
    else:
        setattr(g, 'user', None)


@app.context_processor
def my_context():
    return {'user': g.user}


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
