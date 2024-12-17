import bcrypt
from flask import jsonify, make_response
import jwt
import datetime
from utils.serialize import serialize_user_status
from .db import (
  get_user_by_username,
  insert_user,
  update_user_favorites,
  update_user_watchlist,
  update_user_watched,
  blacklist_token
)
from utils.globals import config


def register_user(data):
  if not data or not data.get('username') or not data.get('password'):
    return make_response(jsonify({'message': 'Username and password are required'}), 400)

  existing_user = get_user_by_username(data['username'])
  if existing_user:
    return make_response(jsonify({'message': 'Username already exists'}), 400)

  hashed_password = bcrypt.hashpw(bytes(data['password'], 'UTF-8'), bcrypt.gensalt())
  new_user = {
    'username': data['username'],
    'password': hashed_password,
    'admin': False
  }

  insert_user(new_user)
  return make_response(jsonify({'message': 'User registered successfully'}), 200)


def login_user(auth):
  if auth:
    user = get_user_by_username(auth.username)
    if user and bcrypt.checkpw(bytes(auth.password, 'UTF-8'), user['password']):
      token = jwt.encode({
        'user': auth.username,
        'admin': user['admin'],
        'exp': datetime.datetime.utcnow() + datetime.timedelta(minutes=30)
      }, config.app.authentication.secret_key, algorithm=config.app.authentication.algorithm)
      return make_response(jsonify({'token': token, 'userInfo': serialize_user(user), 'status': 'success'}), 200)
  return make_response(jsonify({'message': 'Username or password is incorrect'}), 401)


def serialize_user(user):
  return {
    "_id": str(user["_id"]),  # 将 ObjectId 转为字符串
    "username": user.get("username"),
    "favorites": user.get("favorites", []),
    "watchlist": user.get("watchlist", []),
    "watched": user.get("watched", []),
    # 如果有时间字段，转换为 ISO 格式
    "created_at": user.get("created_at").isoformat() if user.get("created_at") else None,
  }


def logout_user(token):
  blacklist_token(token)
  return make_response(jsonify({'message': 'Logout successful'}), 200)


def favorite_episode(token, episode_id):
  user_data = jwt.decode(token, config.app.authentication.secret_key, algorithms=config.app.authentication.algorithm)
  username = user_data['user']
  user = get_user_by_username(username)

  if episode_id in user.get('favorites', []):
    update_user_favorites(username, episode_id, remove=True)
    return make_response(jsonify({"message": "Episode removed from favorites"}), 200)
  else:
    update_user_favorites(username, episode_id)
    return make_response(jsonify({"message": "Episode added to favorites"}), 200)


def mark_episode_status(token, episode_id, status):
  if status not in ['to_watch', 'watched']:
    return make_response(jsonify({"error": "Invalid status"}), 400)

  user_data = jwt.decode(token, config.app.authentication.secret_key, algorithms=config.app.authentication.algorithm)
  username = user_data['user']
  user = get_user_by_username(username)

  if status == 'to_watch':
    if episode_id in user.get('watchlist', []):
      update_user_watchlist(username, episode_id, remove=True)
      return make_response(jsonify({"message": "Episode removed from watchlist"}), 200)
    else:
      update_user_watchlist(username, episode_id)
      return make_response(jsonify({"message": "Episode added to watchlist"}), 200)
  elif status == 'watched':
    if episode_id in user.get('watched', []):
      update_user_watched(username, episode_id, remove=True)
      return make_response(jsonify({"message": "Episode removed from watched list"}), 200)
    else:
      update_user_watched(username, episode_id)
      return make_response(jsonify({"message": "Episode marked as watched"}), 200)


def get_user_status(username):
  user_status = get_user_by_username(username)
  if user_status:
    return serialize_user_status(user_status)
  return None
