from flask import Flask
from flask_cors import CORS, cross_origin
from flask_socketio import SocketIO

socketio = SocketIO()
cors = CORS()


def create_app():
    app = Flask(__name__)
    app.config["CORS_HEADERS"] = "Content-Type"
    cors.init_app(app)
    socketio.init_app(app, cors_allowed_origins="*", logger=True, async_mode="eventlet")
    with app.app_context():
        from app import views
    return app
