from flask import Flask, jsonify, request
import mysql.connector

from . import app, connection_pool, db_config
