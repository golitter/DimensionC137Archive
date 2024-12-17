
def serialize_user_status(user_status):
    return {
        "username": user_status.get("username"),
        "favorites": user_status.get("favorites", []),
        "watchlist": user_status.get("watchlist", []),
        "watched": user_status.get("watched", []),
    }

def serialize_comment(comment):
    return {
        "_id": str(comment.get("_id")),
        "username": comment.get("username"),
        "comment": comment.get("comment"),
        "timestamp": comment.get("timestamp").isoformat() if comment.get("timestamp") else None,
        "likes": comment.get("likes", 0),  # Gets the number of likes, which is 0 by default
        "liked_by": comment.get("liked_by", [])  # The list of users who get likes is empty by default
    }


def serialize_episode(episode):
    return {
        "_id": str(episode.get("_id")),
        "url": episode.get("url"),
        "name": episode.get("name"),
        "season": episode.get("season"),
        "number": episode.get("number"),
        "airdate": episode.get("airdate"),
        "runtime": episode.get("runtime"),
        "rating": {
            "average": episode.get("rating", {}).get("average")
        },
        "image": {
            "medium": episode.get("image", {}).get("medium"),
            "original": episode.get("image", {}).get("original")
        },
        "summary": episode.get("summary"),
        "comments": [serialize_comment(comment) for comment in episode.get("comments", [])],
        "likes": episode.get("likes")
    }