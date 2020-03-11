from flask import (Flask, jsonify, redirect, session, make_response, 
                   flash, request, render_template)
from functools import wraps
from model import User, Friend, Post, Comment, db
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)


def login_required(func):
    @wraps(func)
    def decorated_function(*args, **kwargs):
        if not session.get('user_id'):
            flash("You must be logged in to see the page.")
            return redirect('/')
        return func(*args, **kwargs)

    return decorated_function


@app.route('/')
def index():
    """Show the sign up/login page."""

    return render_template('index.html')


@app.route('/feed')
@login_required
def show_feed():
    """Show the logged in user's customized feed."""
    user_id = session.get('user_id')
    user = User.query.get(user_id)

    return render_template('feed.html',user=user)


@app.route('/signup', methods=['POST'])
def signup():
    email_address = request.form.get('email_address')
    email_in_use = User.query.filter_by(email_address=email_address).first()

    if email_in_use:
        flash('User not created. Email already in use.')
        return redirect('/')

    first_name = request.form.get('first_name')
    last_name = request.form.get('last_name')
    signup_password = request.form.get('signup_password')

    new_user = User(first_name=first_name, 
                    last_name=last_name,
                    email_address=email_address,
                    password=generate_password_hash(signup_password),
                    created_on=datetime.today(),
                    modified_on=datetime.today(),
                    public=True, active=True)

    db.session.add(new_user)
    db.session.commit()

    flash('User created successfully. Please log in.')
    return redirect('/')


@app.route('/login', methods=['POST'])
def login():

    content = request.get_json()
    unhashed_password = content['password']
    email = content['email']

    user = User.query.filter_by(email_address=email).first()

    resp_dict = {}
    if user and check_password_hash(user.password, unhashed_password):
        resp_dict['success'] = True
        session['user_id'] = user.user_id
        flash('You are logged in.')
    else :
        resp_dict['success'] = False

    resp = make_response(jsonify(resp_dict), 200)
    return resp


@app.route('/logout', methods=['POST'])
def logout():
    if session.get('user_id'):
        del session['user_id']

    flash('You have been logged out.')
    resp = make_response(jsonify({'logged_out': True}), 200)
    return resp


@app.route('/user/<int:user_id>')
@login_required
def show_user(user_id):
    """Show the user's posts """
    user = User.query.get(user_id)

    return render_template('user.html',user=user)


@app.route('/post', methods=['POST'])
@login_required
def add_post():

    user_id = request.form.get('user_id')
    message = request.form.get('message')

    post = Post(user_id=user_id, 
                posted_on=datetime.today(), 
                modified_on=datetime.today(),
                message=message,
                active=True)

    db.session.add(post)
    db.session.commit()
    resp = make_response(status=200)
    return resp


@app.route('/comment', methods=['POST'])
@login_required
def add_comment():

    post_id = request.form.get('post_id')
    user_id = request.form.get('user_id')
    comment = request.form.get('comment')

    comment = Comment(post_id=post_id,
                      user_id=user_id,
                      commented_on=datetime.today(),
                      modified_on=datetime.today(),
                      comment=comment,
                      active=True)

    db.session.add(comment)
    db.session.commit()

    resp = make_response(status=200)
    return resp


@app.route('/friend', methods=['POST'])
@login_required
def add_friendship():

    user_1 = request.form.get('user_1')
    user_2 = request.form.get('user_2')

    friendship = Friend(user_1=user_1, 
                        user_2=user_2, 
                        active=True, 
                        friended_on=datetime.today(),
                        modified_on=datetime.today())

    db.session.add(friendship)
    db.session.commit()

    resp = make_response(status=200)
    return resp