from flask import Blueprint, request, make_response, jsonify
from utils.auth_decorators import jwt_required
from .services import (
    create_comment,
    edit_existing_comment,
    get_sorted_comments_by_likes,
    get_username_from_token,
    like_or_unlike_comment,
    remove_comment
)

comments_bp = Blueprint("comments_bp", __name__)

# Add a new comment
@comments_bp.route('/api/episodes/<string:episode_id>/comments', methods=['POST'])
@jwt_required
def add_comment(episode_id):
    comment = request.json.get('comment')

    if not comment:
        return make_response(jsonify({"error": "Comment cannot be empty"}), 400)

    token = request.headers['x-access-token']

    return create_comment(episode_id, comment, token)

# Change an existing comment
@comments_bp.route('/api/episodes/<string:episode_id>/comments/<string:comment_id>', methods=['PUT'])
@jwt_required
def edit_comment(episode_id, comment_id):
    token = request.headers['x-access-token']
    new_comment = request.json.get('comment')

    if not new_comment:
        return make_response(jsonify({"error": "Comment cannot be empty"}), 400)

    return edit_existing_comment(episode_id, comment_id, new_comment, token)

# Delete a comment
@comments_bp.route('/api/episodes/<string:episode_id>/comments/<string:comment_id>', methods=['DELETE'])
@jwt_required
def delete_comment(episode_id, comment_id):
    token = request.headers['x-access-token']

    return remove_comment(episode_id, comment_id, token)

# Like or unlike a comment
@comments_bp.route('/api/episodes/<string:episode_id>/comments/<string:comment_id>/like', methods=['POST'])
@jwt_required
def like_comment(episode_id, comment_id):
    token = request.headers['x-access-token']
    username = get_username_from_token(token)

    result = like_or_unlike_comment(episode_id, comment_id, username)

    return result


# Get all comments sorted by likes
@comments_bp.route('/api/episodes/<string:episode_id>/comments/sorted_by_likes', methods=['GET'])
def get_comments_sorted_by_likes(episode_id):
    result = get_sorted_comments_by_likes(episode_id)
    if result:
        return make_response(jsonify(result), 200)
    return make_response(jsonify({"error": "Episode not found"}), 404)
