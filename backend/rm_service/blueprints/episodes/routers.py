
from flask import Blueprint, request, make_response, jsonify

from .services import (
    get_average_rating,
    get_episodes_by_rating,
    get_episodes_sorted_by_likes,
    get_episodes_sorted_by_rating,
    get_next_episode,
    get_previous_episode,
    serialize_episode,
    get_all_episodes,
    get_episode_details,
    like_episode,
    get_random_episode,
    search_episodes_service
)

episodes_bp = Blueprint("episodes_bp", __name__)

# Get a list of all episodes
@episodes_bp.route('/api/episodes', methods=['GET'])
def get_all_episodes_route():
    episodes = get_all_episodes()
    serialized_episodes = [serialize_episode(episode) for episode in episodes]
    return make_response(jsonify(serialized_episodes), 201)

# Get details of a specific episode
@episodes_bp.route('/api/episodes/<string:episode_id>', methods=['GET'])
def get_episode_details_route(episode_id):
    episode = get_episode_details(episode_id)
    if episode:
        return make_response(jsonify(serialize_episode(episode)), 201)
    return make_response(jsonify({"error": "Episode not found"}), 404)

# Like an episode
@episodes_bp.route('/api/episodes/<string:episode_id>/like', methods=['POST'])
def like_episode_route(episode_id):
    like_episode(episode_id)
    return make_response(jsonify({"message": "Episode liked successfully"}), 200)

# Get a random episode
@episodes_bp.route('/api/episodes/random', methods=['GET'])
def get_random_episode_route():
    random_episode = get_random_episode()
    if random_episode:
        random_episode['_id'] = str(random_episode['_id'])
        random_episode = serialize_episode(random_episode)
        return make_response(jsonify(random_episode), 200)
    return make_response(jsonify({"error": "No episodes available"}), 404)

# Get a list of episodes sorted by rating
@episodes_bp.route('/api/episodes/sorted_by_rating', methods=['GET'])
def sorted_by_rating():
    return get_episodes_sorted_by_rating()

# Get a list of episodes by rating range
@episodes_bp.route('/api/episodes/rating', methods=['GET'])
def rating_range():
    min_rating = request.args.get('min', type=float)
    max_rating = request.args.get('max', type=float)

    if min_rating is None or max_rating is None:
        return make_response(jsonify({"error": "Minimum and maximum ratings are required"}), 400)

    return get_episodes_by_rating(min_rating, max_rating)

# Get a list of episodes sorted by likes
@episodes_bp.route('/api/episodes/sorted_by_likes', methods=['GET'])
def sorted_by_likes():
    sort_order = request.args.get('order', 'desc').lower()

    if sort_order not in ['asc', 'desc']:
        return make_response(jsonify({"error": "Invalid sort order. Use 'asc' or 'desc'."}), 400)

    return get_episodes_sorted_by_likes(sort_order)


# Get the previous episode
@episodes_bp.route('/api/episodes/<int:season>/<int:number>/prev', methods=['GET'])
def get_previous_episode_route(season, number):
    previous_episode = get_previous_episode(season, number)
    if not previous_episode:
        return make_response(jsonify({"error": "Previous episode not found"}), 404)

    return make_response(jsonify({
        "previous_episode": serialize_episode(previous_episode)
    }), 200)

# Get the next episode
@episodes_bp.route('/api/episodes/<int:season>/<int:number>/next', methods=['GET'])
def get_next_episode_route(season, number):
    next_episode = get_next_episode(season, number)
    if not next_episode:
        return make_response(jsonify({"error": "Next episode not found"}), 404)

    return make_response(jsonify({
        "next_episode": serialize_episode(next_episode)
    }), 200)


# Get the average rating of all episodes
@episodes_bp.route("/api/episodes/average_rating", methods=["GET"])
def average_rating():
    try:
        average_rating = get_average_rating()

        if average_rating is not None:
            return make_response(jsonify({"average_rating": average_rating}), 200)
        else:
            return make_response(jsonify({"message": "No episodes found"}), 404)

    except Exception as e:
        return make_response(jsonify({"error": str(e)}), 500)  # 返回错误信息

# Search episodes --
# 2024年12月6日 更新代码
@episodes_bp.route('/api/episodes/search', methods=['GET'])
def search_episodes():
    """
    模糊搜索 API，支持对 name 和 summary 字段的关键词搜索。
    """
    keyword = request.args.get('q', '')  # 获取查询参数
    if not keyword:
        return jsonify({"error": "Please provide a search keyword using the 'q' parameter."}), 400

    # 调用 service 层处理逻辑
    results = search_episodes_service(keyword)
    # print(results)
    serialized_episodes = [serialize_episode(episode) for episode in results]

    # 返回查询结果
    return make_response(jsonify(serialized_episodes), 200)
