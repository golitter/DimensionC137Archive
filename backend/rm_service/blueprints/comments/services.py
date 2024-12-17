import datetime
from bson import ObjectId
from flask import jsonify, make_response
from utils.serialize import serialize_comment
from .db import (
    add_comment,
    find_episode_by_id,
    find_episode_by_id_and_comment,
    find_episode_comments,
    update_comment,
    delete_comment,
    update_comment_like
)
import jwt
from utils.globals import config

def create_comment(episode_id, comment, token):
    username = get_username_from_token(token)
    comment_data = {
        "_id": ObjectId(),
        "username": username,
        "comment": comment,
        "timestamp": datetime.datetime.utcnow()
    }
    add_comment(episode_id, comment_data)
    return make_response(jsonify({"message": "Comment added successfully"}), 201)

def edit_existing_comment(episode_id, comment_id, new_comment, token):
    episode = find_episode_by_id(episode_id)

    if not episode:
        return make_response(jsonify({"error": "Episode not found"}), 404)

    comment_to_edit = next((comment for comment in episode.get('comments', []) if str(comment['_id']) == comment_id), None)

    if not comment_to_edit:
        return make_response(jsonify({"error": "Comment not found"}), 404)

    # print(comment_to_edit['username'])
    username = get_username_from_token(token)
    # print(username)
    if comment_to_edit['username'] != username:
        return make_response(jsonify({"error": "You can only edit your own comments"}), 403)

    update_comment(episode_id, comment_id, new_comment)
    return make_response(jsonify({"message": "Comment updated successfully"}), 200)

def remove_comment(episode_id, comment_id, token):
    username = get_username_from_token(token)
    episode = find_episode_by_id(episode_id)

    if not episode:
        return make_response(jsonify({"error": "Episode not found"}), 404)

    comment_to_delete = next((comment for comment in episode.get('comments', []) if str(comment['_id']) == comment_id), None)

    if not comment_to_delete:
        return make_response(jsonify({"error": "Comment not found"}), 404)

    if comment_to_delete['username'] != username:
        return make_response(jsonify({"error": "You can only delete your own comments"}), 403)

    delete_comment(episode_id, comment_id)
    return make_response(jsonify({"message": "Comment deleted successfully"}), 200)
def get_username_from_token(token):
    user_data = jwt.decode(token, config.app.authentication.secret_key, algorithms=config.app.authentication.algorithm)
    return user_data['user']

def like_or_unlike_comment(episode_id, comment_id, username):
    episode = find_episode_by_id_and_comment(episode_id, comment_id)

    if not episode:
        return make_response(jsonify({"error": "Episode or Comment not found"}), 404)

    comment = episode['comments'][0]  # Get target reviews
    likes = comment.get('likes', 0)
    liked_by = comment.get('liked_by', [])  # Track the list of likes

    if username in liked_by:
        # If the user has already liked, cancel the like
        update_comment_like(episode_id, comment_id, -1, username, "remove")
        return make_response(jsonify({"message": "Like removed successfully"}), 200)
    else:
        # If the user doesn't like it, add a like
        update_comment_like(episode_id, comment_id, 1, username, "add")
        return make_response(jsonify({"message": "Comment liked successfully"}), 200)

def get_sorted_comments_by_likes(episode_id):
    episode = find_episode_comments(episode_id)

    if not episode:
        return None  # If the episode does not exist, return None

    # Get and sort the list of comments in descending order of likes
    sorted_comments = sorted(episode.get('comments', []), key=lambda x: x.get('likes', 0), reverse=True)

    serialized_comments = [serialize_comment(comment) for comment in sorted_comments]

    return serialized_comments
