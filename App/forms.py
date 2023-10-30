import wtforms
from wtforms import validators
from wtforms.validators import Email, Length, ValidationError
from .models import *

import re


class PasswordComplexity(object):
    def __init__(self, message=None):
        if not message:
            message = "The password is invalid."
        self.message = message

    def __call__(self, form, field):
        password = field.data
        if not (re.search(r'[A-Z]', password) and
                re.search(r'[a-z]', password) and
                re.search(r'[0-9]', password) and
                re.search(r'[@$!%*?&#]', password)):  # You can modify this regex to include other special characters
            raise ValidationError(self.message)


class RegisterForm(wtforms.Form):
    signUpEmailField = wtforms.StringField(validators=[Email(message="please input the right style")])
    signUpUsernameField = wtforms.StringField(
        validators=[Length(min=1, max=20, message="please input the right length")])
    signUpPasswordField = wtforms.StringField(
        validators=[Length(min=1, max=20, message="please input the right length"), PasswordComplexity()])

    # 如果您要验证用户名是否存在，需要更改此方法名以匹配新字段名
    def validate_signUpUsernameField(self, field):
        username = field.data
        user = User.query.filter_by(username=username).first()
        if user:
            raise wtforms.ValidationError(message="the username has been existed")


class LoginForm(wtforms.Form):
    signInUsernameField = wtforms.StringField()
    signInPasswordField = wtforms.StringField()

    def validate_signInUsernameField(self, field):
        username = field.data
        user = User.query.filter_by(username=username).first()
        if not user:
            raise wtforms.ValidationError(message="the username has not been existed, please register")


class FindForm(wtforms.Form):
    find_uname = wtforms.StringField()
    find_email = wtforms.StringField(validators=[Email(message="please input the right style")])
    find_password = wtforms.StringField()

    def validate_find_uname(self, field):
        username = field.data
        user = User.query.filter_by(username=username).first()
        if not user:
            raise wtforms.ValidationError(message="the username has not been existed")



class ChangeInfo(wtforms.Form):
    new_password = wtforms.StringField(validators=[validators.InputRequired(message="Please type.")])
    choose_gender = wtforms.StringField(validators=[validators.InputRequired(message="Please select a gender.")])
    choose_grade = wtforms.StringField(validators=[validators.InputRequired(message="Please select a grade.")])


class AddInfo(wtforms.Form):
    add_new_username = wtforms.StringField(validators=[validators.InputRequired(message="Please type username.")])
    add_new_password = wtforms.StringField(validators=[validators.InputRequired(message="Please type password.")])
    add_new_email = wtforms.StringField(validators=[Email(message="please input the right style")])
    add_choose_gender = wtforms.StringField(validators=[validators.InputRequired(message="Please select a gender.")])
    add_choose_status = wtforms.StringField(validators=[validators.InputRequired(message="Please select a status.")])
    add_choose_grade = wtforms.StringField(validators=[validators.InputRequired(message="Please select a grade.")])

    def validate_add_new_username(self, field):
        username = field.data
        user = User.query.filter_by(username=username).first()
        if user:
            raise wtforms.ValidationError(message="the username has been existed")

