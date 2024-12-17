
from bson import ObjectId
from bson.errors import InvalidId
from utils import globals


episodes_collection = globals.db.episodes
users_collection = globals.db.users

def get_users_collection():
    return globals.db.users

def get_episodes_collection():
    return globals.db.episodes

def insert_user(user):
    users_collection = get_users_collection()
    users_collection.insert_one(user)

def find_user_by_username(username):
    users_collection = get_users_collection()
    return users_collection.find_one({"username": username})

def find_episode_by_id(episode_id):
    try:
        return episodes_collection.find_one({"_id": ObjectId(episode_id)})
    except InvalidId:
        return None

def update_episode_likes(episode_id):
    episodes_collection.update_one({"_id": ObjectId(episode_id)}, {"$inc": {"likes": 1}})

def update_user_favorites(username, episode_id, add=True):
    users_collection = get_users_collection()
    if add:
        users_collection.update_one(
            {"username": username},
            {"$addToSet": {"favorites": episode_id}}
        )
    else:
        users_collection.update_one(
            {"username": username},
            {"$pull": {"favorites": episode_id}}
        )

def find_all_episodes_sorted_by_rating():
    return list( episodes_collection.find({}).sort("rating.average", -1) )

def find_episodes_by_rating_range(min_rating, max_rating):
    return list(episodes_collection.find({
        "rating.average": {"$gte": min_rating, "$lte": max_rating}
    }))

def find_episodes_sorted_by_likes(sort_direction):
    return list(episodes_collection.find({}).sort("likes", sort_direction))

def find_episode(season, number):
    episodes_collection = get_episodes_collection()
    return episodes_collection.find_one({"season": season, "number": number})

def find_episodes_by_season(season):
    episodes_collection = get_episodes_collection()
    return list(episodes_collection.find({"season": season}))

def find_last_season():
    episodes_collection = get_episodes_collection()
    return episodes_collection.find().sort("season", -1).limit(1)

def find_last_episode_of_season(season):
    episodes_collection = get_episodes_collection()
    return episodes_collection.find({"season": season}).sort("number", -1).limit(1)
