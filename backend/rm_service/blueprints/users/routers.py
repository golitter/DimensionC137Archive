from flask import Blueprint, jsonify, make_response, request
from utils.auth_decorators import jwt_required

from .services import (
    register_user,
    login_user, logout_user,
    favorite_episode,
    mark_episode_status,
    get_user_status # type: ignore
)

users_bp = Blueprint("users_bp", __name__)

# Register User
@users_bp.route("/api/register", methods=["POST"])
def register():
    data = request.get_json()
    return register_user(data)

# Login User
@users_bp.route("/api/login", methods=["GET"])
def login():
    auth = request.authorization
    return login_user(auth)

# Logout User
@users_bp.route("/api/logout", methods=["GET"])
@jwt_required
def logout():
    token = request.headers['x-access-token']
    return logout_user(token)

# Favorite Episode
@users_bp.route('/api/episodes/<string:episode_id>/favorite', methods=['POST'])
@jwt_required
def favorite_episode_route(episode_id):
    token = request.headers['x-access-token']
    return favorite_episode(token, episode_id)

# Mark Episode Status
@users_bp.route('/api/episodes/<string:episode_id>/status', methods=['POST'])
@jwt_required
def mark_status(episode_id):
    token = request.headers['x-access-token']
    status = request.json.get('status')
    return mark_episode_status(token, episode_id, status)

# Get User Status
@users_bp.route('/api/users/<string:username>/status', methods=['GET'])
@jwt_required
def get_user_status_route(username):
    user_status = get_user_status(username)
    if user_status is None:
        return make_response(jsonify({"error": "User not found"}), 404)
    return make_response(jsonify(user_status), 200)

