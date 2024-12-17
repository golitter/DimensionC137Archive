from flask import request, jsonify, make_response
import jwt
from functools import wraps
from utils.globals import config, db

# Gets a collection of blacklists to store the canceled ones JWT
blacklist = db.blacklist

# Decorator function to verify that the JWT exists, is valid, and has not been canceled
def jwt_required(func):
    @wraps(func)
    def jwt_required_wrapper(*args, **kwargs):
        token = None
        if 'x-access-token' in request.headers:
            token = request.headers['x-access-token']

        if not token:
            return make_response(jsonify({'message': 'Token is missing'}), 401)

        try:
            data = jwt.decode(token, config.app.authentication.secret_key, algorithms=config.app.authentication.algorithm)
        except jwt.ExpiredSignatureError:
            return make_response(jsonify({'message': 'Token has expired'}), 401)
        except jwt.InvalidTokenError:
            return make_response(jsonify({'message': 'Token is invalid'}), 401)

        bl_token = blacklist.find_one({'token': token})
        if bl_token is not None:
            return make_response(jsonify({'message': 'Token has been cancelled'}), 401)

        return func(*args, **kwargs)
    return jwt_required_wrapper

# Decorator function to verify that the JWT has administrator rights
def admin_required(func):
    @wraps(func)
    def admin_required_wrapper(*args, **kwargs):
        # Get the JWT from the request header
        token = None
        if 'x-access-token' in request.headers:
            token = request.headers['x-access-token']
        else:
            # If no token is provided, a 401 error is returned
            return make_response(jsonify({'message': 'Token is missing'}), 401)

        try:
            # Try to decode the token using server-side keys and the HS256 algorithm
            data = jwt.decode(token, config.app.authentication.secret_key, algorithms=config.app.authentication.algorithm)
        except:
            # If the token is invalid or decoding fails, a 401 error is returned
            return make_response(jsonify({'message': 'Token is invalid'}), 401)

    return admin_required_wrapper
