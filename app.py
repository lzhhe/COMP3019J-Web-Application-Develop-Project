from flask import Flask, render_template
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import text

from forms import RegistrationForm, LoginForm, FindPasswordForm

app = Flask(__name__)
app.secret_key = 'COMP3019J'

HOSTNAME = "127.0.0.1"
PORT = 3306
USERNAME = "root"
PASSWORD = "123456"
DATABASE = "calendar_application"
app.config[
    'SQLALCHEMY_DATABASE_URI'] = f"mysql+pymysql://{USERNAME}:{PASSWORD}@{HOSTNAME}:{PORT}/{DATABASE}?charset=utf8mb4"

db = SQLAlchemy(app)

with app.app_context():
    with db.engine.connect() as conn:
        result = conn.execute(text("select 1"))
        print(result.fetchone())  # (1,)


@app.route('/')
def run():
    reg_form = RegistrationForm()
    login_form = LoginForm()
    find_form = FindPasswordForm()
    print(1111111)
    return render_template('loginMix.html', form={"reg_form": reg_form, "login_form": login_form, "find_form": find_form})

# @app.route('/main')
# def main():
#     return render_template('main.html')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
