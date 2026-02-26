from flask import Flask, jsonify, request
from flask_cors import CORS
import mysql.connector

app = Flask(__name__)
CORS(app)

# MySQL connection
db = mysql.connector.connect(
    host="localhost",
    user="flame_user",
    password="REPLACE_WITH_ACTUAL_PASSWORD",
    database="Flame_Keepers"
)

@app.route("/products/<int:product_id>", methods=["GET"])
def get_product(product_id):
    cursor = db.cursor(dictionary=True)

    cursor.execute(
        "SELECT product_id AS id, name, description, price, image_url AS image, stock_quantity FROM products WHERE product_id = %s",
        (product_id,)
    )

    product = cursor.fetchone()
    cursor.close()

    if product:
        return jsonify(product)
    else:
        return jsonify({"error": "Product not found"}), 404

if __name__ == "__main__":
    app.run(debug=True)