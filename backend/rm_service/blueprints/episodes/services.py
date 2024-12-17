
import random
from flask import jsonify, make_response
from utils.serialize import serialize_episode
from .db import (
    find_all_episodes_sorted_by_rating,
    find_episode,
    find_episodes_by_rating_range,
    find_episodes_sorted_by_likes,
    find_last_episode_of_season,
    find_last_season,
    get_episodes_collection,
    update_user_favorites,
    update_episode_likes,
    find_episode_by_id,
    episodes_collection
)



def get_all_episodes():
    """Get all episodes"""
    episodes_collection = get_episodes_collection()
    return list(episodes_collection.find({}))

def get_episode_details(episode_id):
    """Get individual episode details"""
    return find_episode_by_id(episode_id)

def like_episode(episode_id):
    """Like an episode"""
    update_episode_likes(episode_id)

def add_to_favorites(username, episode_id):
    """Adds the episode to the user's favorites list"""
    update_user_favorites(username, episode_id, add=True)

def remove_from_favorites(username, episode_id):
    """Removes the episode from the user's favorites list"""
    update_user_favorites(username, episode_id, add=False)

def get_random_episode():
    """Get random episodes"""
    episodes_collection = get_episodes_collection()
    episodes = list(episodes_collection.find({}))
    if episodes:
        return random.choice(episodes)
    return None
def get_episodes_sorted_by_rating():
    episodes = find_all_episodes_sorted_by_rating()
    serialized_episodes = [serialize_episode(episode) for episode in episodes]
    return make_response(jsonify(serialized_episodes), 200)

def get_episodes_by_rating(min_rating, max_rating):
    episodes = find_episodes_by_rating_range(min_rating, max_rating)
    serialized_episodes = [serialize_episode(episode) for episode in episodes]
    return make_response(jsonify(serialized_episodes), 200)

def get_episodes_sorted_by_likes(sort_order):
    sort_direction = 1 if sort_order == 'asc' else -1
    episodes = find_episodes_sorted_by_likes(sort_direction)
    serialized_episodes = [serialize_episode(episode) for episode in episodes]
    return make_response(jsonify(serialized_episodes), 200)

def get_next_episode(season, number):
    # Try to get the next episode
    next_episode = find_episode(season, number + 1)

    if not next_episode:  # If the next episode does not exist, look for the first episode of the next season
        next_season = season + 1
        next_episode = find_episode(next_season, 1)

        if not next_episode:  # If not the next season, go back to the first episode of the first season
            next_episode = find_episode(1, 1)

    return next_episode

def get_previous_episode(season, number):
    # Try to get the previous episode
    previous_episode = find_episode(season, number - 1)

    if not previous_episode:  # If the last episode didn't exist
        if season == 1:
            # When the current season is 1, return to the final episode of the last season
            last_season_cursor = find_last_season()
            last_season = list(last_season_cursor)

            if last_season:
                last_season_number_cursor = find_last_episode_of_season(last_season[0]["season"])
                return list(last_season_number_cursor)[0] if last_season_number_cursor else None

            return None  # If there aren't any episodes

        # Find the last episode of the previous season
        previous_season = season - 1
        previous_episode_cursor = find_last_episode_of_season(previous_season)
        return list(previous_episode_cursor)[0] if previous_episode_cursor else None

    return previous_episode

def get_average_rating():
    episodes_collection = get_episodes_collection()
    # Aggregate query pipeline
    pipeline = [
        {
            "$match": {
                "rating.average": {"$exists": True}  # Make sure the score field exists
            }
        },
        {
            "$group": {
                "_id": None,  # There is no need to group by field to calculate the overall average score
                "average_rating": {"$avg": "$rating.average"}  # Calculate average score
            }
        }
    ]

    result = list(episodes_collection.aggregate(pipeline))
    return result[0]["average_rating"] if result else None

# 2024年12月6日 更新代码
def search_episodes_service(keyword):
    """
    模糊搜索逻辑，查询 MongoDB。

    :param keyword: 搜索关键词
    :return: 查询结果列表
    """
    # 构建模糊搜索条件
    query = {
        "$or": [
            {"name": {"$regex": keyword, "$options": "i"}},  # 搜索 name 字段，大小写不敏感
            {"summary": {"$regex": keyword, "$options": "i"}}  # 搜索 summary 字段，大小写不敏感
        ]
    }

    # 查询数据库
    results = list(episodes_collection.find(query))  # 不返回 `_id` 字段，可根据需求调整

    return results
