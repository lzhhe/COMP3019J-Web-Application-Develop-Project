from flask import session, g, request, jsonify

from App import create_app  # 第一次执行这个，然后执行蓝图，就执行到了views，再然后是数据库，最后执行到首页，然后再是create_app
from App.extents import db
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


@app.route('/updateColorMode', methods=['POST'])
def update_color_mode():
    # 检查用户是否登录
    if 'uid' in session:
        uid = session['uid']
        user = User.query.get(uid)  # 获取当前登录的用户
        if user:
            data = request.json
            # 假设用户模型中有一个color属性，可以是0或1来表示颜色模式
            user.color = data['color']  # 更新用户的color属性
            db.session.commit()  # 提交更改到数据库
            return jsonify(success=True), 200
        else:
            return jsonify(success=False, message="User not found."), 404
    else:
        # 用户未登录
        return jsonify(success=False, message="User not logged in."), 401


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
