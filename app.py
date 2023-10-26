from App import create_app  # 第一次执行这个，然后执行蓝图，就执行到了views，再然后是数据库，最后执行到首页，然后再是create_app

app = create_app()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)


def db():
    return None