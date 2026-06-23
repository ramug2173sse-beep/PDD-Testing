from flask import Flask
from flask_login import LoginManager
from flask_bcrypt import Bcrypt
from .config import Config
from .db import init_db_connection

login_manager = LoginManager()
bcrypt = Bcrypt()

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Initialize extensions
    login_manager.init_app(app)
    bcrypt.init_app(app)
    login_manager.login_view = 'auth.login'
    login_manager.login_message_category = 'info'
    login_manager.login_message = 'Please log in to access this page.'

    # Register DB teardown
    init_db_connection(app)

    from .models.user import User

    @login_manager.user_loader
    def load_user(user_id):
        return User.get(user_id)

    # Register blueprints
    from .auth import auth as auth_bp
    app.register_blueprint(auth_bp, url_prefix='/auth')

    from .main import main as main_bp
    app.register_blueprint(main_bp)

    from .admin import admin as admin_bp
    app.register_blueprint(admin_bp, url_prefix='/admin')

    return app
