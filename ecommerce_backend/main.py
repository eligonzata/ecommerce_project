from flask import jsonify, request
import mysql.connector

from . import app, get_db


@app.route("/", methods=["GET"])
def home():
    return jsonify({"message": "Flame Keepers API is running!"})


@app.route("/test", methods=["GET"])
def test():
    return jsonify({"message": "API is working!"})


@app.route("/health", methods=["GET"])
def health_check():
    try:
        conn = get_db()
        if conn:
            conn.close()
            return jsonify({"status": "healthy", "database": "connected"})
        else:
            return jsonify({"status": "unhealthy", "database": "disconnected"}), 500
    except Exception as e:
        return jsonify({"status": "unhealthy", "error": str(e)}), 500


# PRODUCTS


@app.route("/products", methods=["GET"])
def get_products():
    conn = get_db()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM v_product_catalog ORDER BY name")
    products = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(products)


@app.route("/products/sale", methods=["GET"])
def get_sale_products():
    conn = get_db()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    cursor = conn.cursor(dictionary=True)
    cursor.execute(
        "SELECT * FROM v_product_catalog WHERE is_on_sale = TRUE ORDER BY name"
    )
    products = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(products)


@app.route("/products/search", methods=["GET"])
def search_products():
    """Usage: GET /products/search?q=lavender"""
    term = request.args.get("q", "")
    if not term:
        return jsonify({"error": "Query parameter 'q' is required"}), 400

    conn = get_db()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    cursor = conn.cursor(dictionary=True)
    cursor.callproc("sp_search_products", [term])
    products = []
    for result in cursor.stored_results():
        products = result.fetchall()
    cursor.close()
    conn.close()
    return jsonify(products)


@app.route("/products/sort", methods=["GET"])
def get_sorted_products():
    """Usage: GET /products/sort?by=price&order=ASC
    GET /products/sort?by=availability"""
    sort_by = request.args.get("by", "price")
    order = request.args.get("order", "ASC").upper()

    if order not in ("ASC", "DESC"):
        return jsonify({"error": "order must be ASC or DESC"}), 400

    conn = get_db()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    cursor = conn.cursor(dictionary=True)

    if sort_by == "availability":
        cursor.callproc("sp_get_products_by_availability")
    else:
        cursor.callproc("sp_get_products_by_price", [order])

    products = []
    for result in cursor.stored_results():
        products = result.fetchall()
    cursor.close()
    conn.close()
    return jsonify(products)


@app.route("/products/<int:product_id>", methods=["GET"])
def get_product(product_id):
    conn = get_db()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    cursor = conn.cursor(dictionary=True)

    cursor.execute(
        "SELECT product_id AS id, name, description, price, sale_price, is_on_sale, image_url AS image, stock_quantity, wick_type FROM products WHERE product_id = %s",
        (product_id,),
    )

    product = cursor.fetchone()
    cursor.close()
    conn.close()

    if product:
        return jsonify(product)
    else:
        return jsonify({"error": "Product not found"}), 404


# this is for the home page tagged products section
@app.route("/products/tagged", methods=["GET"])
def get_products_by_tag():
    tag = request.args.get("tag")
    limit = request.args.get("limit", type=int)

    if not tag:
        return jsonify({"error": "tag parameter is required"}), 400

    conn = get_db()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500

    cursor = conn.cursor(dictionary=True)

    query = """
        SELECT p.*
        FROM v_product_catalog AS p
        JOIN product_tags AS pt ON p.product_id = pt.product_id
        JOIN tags AS t ON pt.tag_id = t.tag_id
        WHERE t.tag_name = %s
    """

    params = [tag]

    if limit:
        query += " LIMIT %s"
        params.append(limit)

    cursor.execute(query, params)
    products = cursor.fetchall()

    cursor.close()
    conn.close()

    return jsonify(products)


# this one is used for the tag filtering on the products page
@app.route("/tags", methods=["GET"])
def get_tags():
    conn = get_db()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500

    cursor = conn.cursor(dictionary=True)

    cursor.execute(
        """
        SELECT tag_id, tag_name
        FROM tags
        ORDER BY tag_name
    """
    )

    tags = cursor.fetchall()

    cursor.close()
    conn.close()

    return jsonify(tags)


# USERS


@app.route("/users", methods=["GET"])
def get_users():
    email = request.args.get("email")
    conn = get_db()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    cursor = conn.cursor(dictionary=True)

    if email:
        cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
    else:
        cursor.execute(
            "SELECT user_id, first_name, last_name, email, phone, user_role, created_at, is_active FROM users"
        )

    users = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(users)


@app.route("/users", methods=["POST"])
def register_user():
    """Body: { first_name, last_name, email, password, phone }"""
    data = request.get_json()
    required = ["first_name", "last_name", "email", "password"]
    if not all(k in data for k in required):
        return jsonify({"error": f"Missing required fields: {required}"}), 400

    conn = get_db()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    cursor = conn.cursor()
    try:
        cursor.execute(
            """INSERT INTO users (first_name, last_name, email, password, phone)
               VALUES (%s, %s, %s, %s, %s)""",
            (
                data["first_name"],
                data["last_name"],
                data["email"],
                data["password"],
                data.get("phone"),
            ),
        )
        conn.commit()
        new_id = cursor.lastrowid
    except mysql.connector.IntegrityError:
        cursor.close()
        conn.close()
        return jsonify({"error": "Email already registered"}), 409
    cursor.close()
    conn.close()
    return jsonify({"message": "User registered successfully", "user_id": new_id}), 201


@app.route("/users/<int:user_id>", methods=["GET"])
def get_user(user_id):
    conn = get_db()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    cursor = conn.cursor(dictionary=True)
    cursor.execute(
        """SELECT user_id, first_name, last_name, email, phone,
                  user_role, created_at, is_active
           FROM users WHERE user_id = %s""",
        (user_id,),
    )
    user = cursor.fetchone()
    cursor.close()
    conn.close()

    if user:
        return jsonify(user)
    return jsonify({"error": "User not found"}), 404


@app.route("/users/<int:user_id>", methods=["PUT"])
def update_user(user_id):
    """Body (any combination): { first_name, last_name, phone }"""
    data = request.get_json()
    allowed = ["first_name", "last_name", "phone"]
    updates = {k: v for k, v in data.items() if k in allowed}

    if not updates:
        return jsonify({"error": "No valid fields to update"}), 400

    set_clause = ", ".join(f"{k} = %s" for k in updates)
    values = list(updates.values()) + [user_id]

    conn = get_db()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    cursor = conn.cursor()
    cursor.execute(f"UPDATE users SET {set_clause} WHERE user_id = %s", values)
    conn.commit()
    affected = cursor.rowcount
    cursor.close()
    conn.close()

    if affected:
        return jsonify({"message": "User updated successfully"})
    return jsonify({"error": "User not found"}), 404


@app.route("/users/<int:user_id>", methods=["DELETE"])
def delete_account(user_id):
    conn = get_db()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    cursor = conn.cursor()
    cursor.execute("DELETE FROM users WHERE user_id = %s", (user_id,))
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({"message": f"user deleted"})


# CART


@app.route("/cart/<int:user_id>", methods=["GET"])
def get_cart(user_id):
    conn = get_db()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM v_user_cart WHERE user_id = %s", (user_id,))
    items = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(items)


@app.route("/cart", methods=["POST"])
def add_to_cart():
    """Body: { user_id, product_id, quantity }"""
    data = request.get_json()
    required = ["user_id", "product_id", "quantity"]
    if not all(k in data for k in required):
        return jsonify({"error": f"Missing required fields: {required}"}), 400

    conn = get_db()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    cursor = conn.cursor()
    cursor.callproc(
        "sp_add_to_cart", [data["user_id"], data["product_id"], data["quantity"]]
    )
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({"message": "Cart updated successfully"}), 201


@app.route("/cart/<int:user_id>/<int:product_id>", methods=["PUT"])
def update_cart_item(user_id, product_id):
    """Body: { quantity }"""
    data = request.get_json()
    quantity = data.get("quantity")
    if quantity is None or quantity < 1:
        return jsonify({"error": "quantity must be 1 or more"}), 400

    conn = get_db()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    cursor = conn.cursor()
    cursor.execute(
        "UPDATE cart SET quantity = %s WHERE user_id = %s AND product_id = %s",
        (quantity, user_id, product_id),
    )
    conn.commit()
    affected = cursor.rowcount
    cursor.close()
    conn.close()

    if affected:
        return jsonify({"message": "Cart item updated"})
    return jsonify({"error": "Cart item not found"}), 404


@app.route("/cart/<int:user_id>/<int:product_id>", methods=["DELETE"])
def remove_from_cart(user_id, product_id):
    conn = get_db()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    cursor = conn.cursor()
    cursor.execute(
        "DELETE FROM cart WHERE user_id = %s AND product_id = %s", (user_id, product_id)
    )
    conn.commit()
    affected = cursor.rowcount
    cursor.close()
    conn.close()

    if affected:
        return jsonify({"message": "Item removed from cart"})
    return jsonify({"error": "Cart item not found"}), 404


@app.route("/cart/<int:user_id>", methods=["DELETE"])
def clear_cart(user_id):
    conn = get_db()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    cursor = conn.cursor()
    cursor.execute("DELETE FROM cart WHERE user_id = %s", (user_id,))
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({"message": "Cart cleared"})


# ORDERS


@app.route("/orders/<int:user_id>", methods=["GET"])
def get_user_orders(user_id):
    conn = get_db()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    cursor = conn.cursor(dictionary=True)
    cursor.execute(
        "SELECT * FROM v_order_summary WHERE customer_email = (SELECT email FROM users WHERE user_id = %s)",
        (user_id,),
    )
    orders = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(orders)


@app.route("/orders/<int:order_id>/items", methods=["GET"])
def get_order_items(order_id):
    conn = get_db()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    cursor = conn.cursor(dictionary=True)
    cursor.execute(
        """SELECT oi.order_item_id, oi.product_id, p.name AS product_name,
                  p.image_url, oi.quantity, oi.unit_price, oi.subtotal
           FROM order_items oi
           JOIN products p ON oi.product_id = p.product_id
           WHERE oi.order_id = %s""",
        (order_id,),
    )
    items = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(items)


@app.route("/orders", methods=["POST"])
def create_order():
    """Body: { user_id, payment_method, discount_code (optional) }"""
    data = request.get_json()
    required = ["user_id", "payment_method"]
    if not all(k in data for k in required):
        return jsonify({"error": f"Missing required fields: {required}"}), 400

    conn = get_db()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    cursor = conn.cursor()
    args = [data["user_id"], data["payment_method"], data.get("discount_code", ""), 0]
    result_args = cursor.callproc("sp_create_order_from_cart", args)
    conn.commit()
    new_order_id = result_args[3]
    cursor.close()
    conn.close()
    return (
        jsonify({"message": "Order placed successfully", "order_id": new_order_id}),
        201,
    )


@app.route("/orders/<int:order_id>/status", methods=["PUT"])
def update_order_status(order_id):
    """Body: { order_status }  (pending | processing | shipped | delivered | cancelled)"""
    data = request.get_json()
    valid_statuses = ("pending", "processing", "shipped", "delivered", "cancelled")
    status = data.get("order_status")

    if status not in valid_statuses:
        return jsonify({"error": f"order_status must be one of {valid_statuses}"}), 400

    conn = get_db()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    cursor = conn.cursor()
    cursor.execute(
        "UPDATE orders SET order_status = %s WHERE order_id = %s", (status, order_id)
    )
    conn.commit()
    affected = cursor.rowcount
    cursor.close()
    conn.close()

    if affected:
        return jsonify({"message": f"Order status updated to '{status}'"})
    return jsonify({"error": "Order not found"}), 404


# DISCOUNT CODES


@app.route("/discounts/validate", methods=["POST"])
def validate_discount():
    """Body: { code, cart_total }"""
    data = request.get_json()
    code = data.get("code")
    cart_total = data.get("cart_total", 0)

    if not code:
        return jsonify({"error": "code is required"}), 400

    conn = get_db()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    cursor = conn.cursor(dictionary=True)
    cursor.execute(
        """SELECT discount_id, code, description, discount_type,
                  discount_value, min_purchase_amount
           FROM discount_codes
           WHERE code = %s AND is_active = TRUE
             AND (end_date IS NULL OR end_date > NOW())
             AND (max_uses IS NULL OR times_used < max_uses)""",
        (code,),
    )
    discount = cursor.fetchone()
    cursor.close()
    conn.close()

    if not discount:
        return (
            jsonify({"valid": False, "error": "Invalid or expired discount code"}),
            404,
        )

    if cart_total < float(discount["min_purchase_amount"]):
        return (
            jsonify(
                {
                    "valid": False,
                    "error": f"Minimum order of ${discount['min_purchase_amount']} required",
                }
            ),
            400,
        )

    return jsonify({"valid": True, "discount": discount})


# ADMIN ROUTES


@app.route("/admin/orders", methods=["GET"])
def admin_get_orders():
    """Usage: GET /admin/orders?sort_by=date|customer|amount&order=DESC"""
    sort_by = request.args.get("sort_by", "date")
    order = request.args.get("order", "DESC").upper()

    if order not in ("ASC", "DESC"):
        return jsonify({"error": "order must be ASC or DESC"}), 400

    conn = get_db()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    cursor = conn.cursor(dictionary=True)

    if sort_by == "customer":
        cursor.callproc("sp_admin_orders_by_customer")
    elif sort_by == "amount":
        cursor.callproc("sp_admin_orders_by_amount", [order])
    else:
        cursor.callproc("sp_admin_orders_by_date", [order])

    orders = []
    for result in cursor.stored_results():
        orders = result.fetchall()
    cursor.close()
    conn.close()
    return jsonify(orders)


@app.route("/admin/users", methods=["GET"])
def admin_get_users():
    conn = get_db()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    cursor = conn.cursor(dictionary=True)
    cursor.execute(
        """SELECT user_id, first_name, last_name, email,
                  phone, user_role, created_at, is_active
           FROM users ORDER BY created_at DESC"""
    )
    users = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(users)


@app.route("/admin/discounts", methods=["GET"])
def admin_get_discounts():
    conn = get_db()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM discount_codes ORDER BY created_at DESC")
    codes = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(codes)


@app.route("/admin/discounts", methods=["POST"])
def admin_create_discount():
    """Body: { code, description, discount_type, discount_value,
    min_purchase_amount, max_uses, end_date }"""
    data = request.get_json()
    required = ["code", "discount_type", "discount_value"]
    if not all(k in data for k in required):
        return jsonify({"error": f"Missing required fields: {required}"}), 400

    conn = get_db()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    cursor = conn.cursor()
    try:
        cursor.execute(
            """INSERT INTO discount_codes
               (code, description, discount_type, discount_value,
                min_purchase_amount, max_uses, end_date)
               VALUES (%s, %s, %s, %s, %s, %s, %s)""",
            (
                data["code"],
                data.get("description"),
                data["discount_type"],
                data["discount_value"],
                data.get("min_purchase_amount", 0),
                data.get("max_uses"),
                data.get("end_date"),
            ),
        )
        conn.commit()
        new_id = cursor.lastrowid
    except mysql.connector.IntegrityError:
        cursor.close()
        conn.close()
        return jsonify({"error": "Discount code already exists"}), 409
    cursor.close()
    conn.close()
    return jsonify({"message": "Discount code created", "discount_id": new_id}), 201


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5001)
