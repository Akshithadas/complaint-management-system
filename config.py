import os

db_url = os.environ.get('DATABASE_URL')
if db_url and db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

if not db_url:
    if os.environ.get('VERCEL'):
        db_url = 'sqlite:////tmp/complaint.db'
    else:
        db_url = 'sqlite:///complaints.db'

SQLALCHEMY_DATABASE_URI = db_url
SQLALCHEMY_TRACK_MODIFICATIONS = False
SECRET_KEY = os.environ.get('SECRET_KEY', 'complaintsystemkey')
GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY', '')