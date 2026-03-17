from flask import Flask
from flask_cors import CORS
from mysql.connector import pooling
import os
from dotenv import load_dotenv

load_dotenv()  # take environment variables from .env.

app = Flask(__name__)

CORS(
    app,
    origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001"],
    supports_credentials=True,
    allow_headers=["Content-Type", "Authorization"],
)

db_config = {
    "host": os.getenv("DB_HOST"),
    "user": "root",
    "password": os.getenv("DB_PASSWORD"),
    "database": "Flame_Keepers",
}

connection_pool = pooling.MySQLConnectionPool(
    pool_name="flame_pool", pool_size=5, **db_config
)

import ecommerce_backend.app
import ecommerce_backend.admin
