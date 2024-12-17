from utils import globals

users_collection = globals.db.users
blacklist_collection = globals.db.blacklist

def get_user_by_username(username):
    return users_collection.find_one({"username": username})

def insert_user(user_data):
    users_collection.insert_one(user_data)

def update_user_favorites(username, episode_id, remove=False):
    if remove:
        users_collection.update_one(
            {"username": username},
            {"$pull": {"favorites": episode_id}}
        )
    else:
        users_collection.update_one(
            {"username": username},
            {"$addToSet": {"favorites": episode_id}}
        )

def update_user_watchlist(username, episode_id, remove=False):
    if remove:
        users_collection.update_one(
            {"username": username},
            {"$pull": {"watchlist": episode_id}}
        )
    else:
        users_collection.update_one(
            {"username": username},
            {"$addToSet": {"watchlist": episode_id}, "$pull": {"watched": episode_id}}
        )

def update_user_watched(username, episode_id, remove=False):
    if remove:
        users_collection.update_one(
            {"username": username},
            {"$pull": {"watched": episode_id}}
        )
    else:
        users_collection.update_one(
            {"username": username},
            {"$addToSet": {"watched": episode_id}, "$pull": {"watchlist": episode_id}}
        )

def blacklist_token(token):
    blacklist_collection.insert_one({'token': token})
