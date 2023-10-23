from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField
from wtforms.validators import DataRequired, Length, Email


class RegistrationForm(FlaskForm):
    reg_username = StringField('Username',
                               validators=[DataRequired(), Length(max=25)],
                               render_kw={"id": 'signUpUsernameField'})

    reg_email = StringField('Email Address',
                            validators=[DataRequired(), Email(), Length(max=50)],
                            render_kw={"id": 'signUpEmailField'})

    reg_password = PasswordField('Password',
                                 validators=[DataRequired()],
                                 render_kw={"id": 'signUpPasswordField'})


class LoginForm(FlaskForm):
    login_username = StringField('Username',
                                 validators=[DataRequired(), Length(max=25)],
                                 render_kw={"id": 'signInUsernameField'})

    login_password = PasswordField('Password',
                                   validators=[DataRequired()],
                                   render_kw={"id": 'signInPasswordField'})


class FindPasswordForm(FlaskForm):
    find_username = StringField('Username',
                                validators=[DataRequired(), Length(max=25)],
                                render_kw={"id": 'find_uname'})

    find_email = StringField('Email Address',
                             validators=[DataRequired(), Email(), Length(max=50)],
                             render_kw={"id": 'find_email'})

