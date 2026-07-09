import os
SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL', 'mysql+pymysql://root:root123@localhost/complaint_db')
SQLALCHEMY_TRACK_MODIFICATIONS = False
SECRET_KEY = os.environ.get('SECRET_KEY', 'complaintsystemkey')
GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY', 'your-key-here')