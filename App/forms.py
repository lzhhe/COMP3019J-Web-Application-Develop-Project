import wtforms
from wtforms import validators
from wtforms.validators import Email, Length, ValidationError, Optional, DataRequired, NumberRange
from .models import *
import datetime

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
        validators=[Length(min=1, max=200, message="please input the right length")])
    signUpPasswordField = wtforms.StringField(
        validators=[Length(min=1, max=200, message="please input the right length"), PasswordComplexity()])

    # 如果您要验证用户名是否存在，需要更改此方法名以匹配新字段名
    def validate_signUpUsernameField(self, field):
        username = field.data
        user = User.query.filter_by(username=username).first()
        if user:
            raise wtforms.ValidationError(message="the username has been existed")


class LoginForm(wtforms.Form):
    signInUsernameField = wtforms.StringField(validators=[DataRequired()])
    signInPasswordField = wtforms.StringField(validators=[DataRequired()])

    def validate_signInUsernameField(self, field):
        username = field.data
        user = User.query.filter_by(username=username).first()
        if not user:
            raise wtforms.ValidationError(message="the username has not been existed, please register")


class FindForm(wtforms.Form):
    find_uname = wtforms.StringField(validators=[DataRequired()])
    find_email = wtforms.StringField(validators=[Email(message="please input the right style")])
    find_password = wtforms.StringField(validators=[DataRequired()])

    def validate_find_uname(self, field):
        username = field.data
        user = User.query.filter_by(username=username).first()
        if not user:
            raise wtforms.ValidationError(message="the username has not been existed")


class ChangeInfo(wtforms.Form):
    user_uid = wtforms.StringField()
    new_password = wtforms.StringField(validators=[Optional()])
    choose_gender = wtforms.StringField(validators=[Optional()])
    choose_grade = wtforms.StringField(validators=[Optional()])


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


class AddEvent(wtforms.Form):
    title = wtforms.StringField('Event Title', validators=[DataRequired(), Length(max=256)])
    content = wtforms.TextAreaField('Content')
    startDate = wtforms.DateField('Start Date', validators=[DataRequired()])
    endDate = wtforms.DateField('End Date', validators=[DataRequired()])
    color = wtforms.IntegerField('Color', validators=[DataRequired()])


class UpdateEvent(wtforms.Form):
    eid = wtforms.StringField()
    title = wtforms.StringField(validators=[Optional()])
    content = wtforms.StringField(validators=[Optional()])
    startDate = wtforms.StringField(validators=[Optional()])
    endDate = wtforms.StringField(validators=[Optional()])
    color = wtforms.StringField(validators=[Optional()])


class AddSchedule(wtforms.Form):
    title = wtforms.StringField('Schedule Title', validators=[DataRequired(), Length(max=256)])
    content = wtforms.TextAreaField('Content')
    date = wtforms.DateField('Date', validators=[DataRequired()])
    startTime = wtforms.TimeField('Start Time', validators=[Optional()])
    endTime = wtforms.TimeField('End Time', validators=[DataRequired()])
    color = wtforms.IntegerField('Color', validators=[DataRequired()])


class UpdateSchedule(wtforms.Form):
    sid = wtforms.StringField()
    title = wtforms.StringField('Schedule Title', validators=[Optional()])
    content = wtforms.TextAreaField('Content', validators=[Optional()])
    date = wtforms.DateField('Date', validators=[Optional()])
    startTime = wtforms.TimeField('Start Time', validators=[Optional()])
    endTime = wtforms.TimeField('End Time', validators=[Optional()])
    color = wtforms.IntegerField('Color', validators=[Optional()])


class UpdateDeadline(wtforms.Form):
    did = wtforms.StringField()
    title = wtforms.StringField('Schedule Title', validators=[Optional()])
    content = wtforms.TextAreaField('Content', validators=[Optional()])
    date = wtforms.DateField('Date', validators=[Optional()])
    endTime = wtforms.TimeField('End Time', validators=[Optional()])
    color = wtforms.IntegerField('Color', validators=[Optional()])
