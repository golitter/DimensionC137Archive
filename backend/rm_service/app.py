from flask import Flask
from flask_cors import CORS
from blueprints.comments.routers import comments_bp
from blueprints.episodes.routers import episodes_bp
from blueprints.users.routers import users_bp
from utils.globals import config


app = Flask(__name__)
app.register_blueprint(comments_bp)
app.register_blueprint(episodes_bp)
app.register_blueprint(users_bp)
CORS(app)
app.config['DEBUG'] = getattr(config.app, 'debug', False)

if __name__ == "__main__":
    app.run()
