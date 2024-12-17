from bson import ObjectId
from utils import globals

episodes_collection = globals.db.episodes

def add_comment(episode_id, comment_data):
    episodes_collection.update_one(
        {"_id": ObjectId(episode_id)},
        {"$push": {"comments": comment_data}}
    )

def find_episode_by_id(episode_id):
    return episodes_collection.find_one({"_id": ObjectId(episode_id)})

def update_comment(episode_id, comment_id, new_comment):
    episodes_collection.update_one(
        {"_id": ObjectId(episode_id), "comments._id": ObjectId(comment_id)},
        {"$set": {"comments.$.comment": new_comment}}
    )

def delete_comment(episode_id, comment_id):
    episodes_collection.update_one(
        {"_id": ObjectId(episode_id)},
        {"$pull": {"comments": {"_id": ObjectId(comment_id)}}}
    )

def find_episode_by_id_and_comment(episode_id, comment_id):
    """Find the specified episode and its reviews"""
    return episodes_collection.find_one(
        {"_id": ObjectId(episode_id), "comments._id": ObjectId(comment_id)},
        {"comments.$": 1}  # Get only matched reviews
    )

def update_comment_like(episode_id, comment_id, like_change, username, action):
    """Update the logic for liking or unliking"""
    if action == "add":
        # When you like, increase the number of likes and add users
        episodes_collection.update_one(
            {"_id": ObjectId(episode_id), "comments._id": ObjectId(comment_id)},
            {"$inc": {"comments.$.likes": like_change}, "$addToSet": {"comments.$.liked_by": username}}
        )
    elif action == "remove":
        # When unliking, reduce the number of likes and remove the user
        episodes_collection.update_one(
            {"_id": ObjectId(episode_id), "comments._id": ObjectId(comment_id)},
            {"$inc": {"comments.$.likes": like_change}, "$pull": {"comments.$.liked_by": username}}
        )

def find_episode_comments(episode_id):
    """Find reviews of the specified episode"""
    return episodes_collection.find_one({"_id": ObjectId(episode_id)}, {"comments": 1})
