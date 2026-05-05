from flask import Blueprint, render_template

bp = Blueprint('card', __name__, url_prefix='/card')

@bp.route('/list')
def list():
    return render_template('card/list.html')

@bp.route('/create')
def create():
    return render_template('card/create.html')

@bp.route('/<int:id>')
def detail(id):
    return render_template('card/detail.html')

@bp.route('/<int:id>/edit')
def edit(id):
    return render_template('card/edit.html')