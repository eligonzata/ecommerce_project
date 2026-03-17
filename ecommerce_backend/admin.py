from flask import Flask, jsonify, request, abort

from . import app, get_db


# Whitelist of tables that can be queried
ADMIN_DASHBOARD_ALLOWED_TABLES = [
    "users",
    "discount_codes",
    "products",
    "v_product_catalog",
    "tags",
    "orders",
]


@app.route("/schemas", methods=["GET"])
def get_schema():

    tables_param = request.args.get("tables")
    if not tables_param:
        abort(400, description="Missing 'tables' query parameter")

    requested_tables = [t.strip() for t in tables_param.split(",")]

    # Enforce whitelist
    for table in requested_tables:
        if table not in ADMIN_DASHBOARD_ALLOWED_TABLES:
            abort(403, description=f"Table '{table}' is not allowed")

    conn = get_db()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    cursor = conn.cursor(dictionary=True)

    schemas = {}

    for table_name in requested_tables:
        cursor.execute(
            """
            SELECT COLUMN_NAME, DATA_TYPE
            FROM information_schema.columns
            WHERE TABLE_NAME = %s
            ORDER BY ordinal_position
            """,
            (table_name,),
        )
        result = cursor.fetchall()
        schemas[table_name] = [
            {"sqlName": row["COLUMN_NAME"], "sqlType": row["DATA_TYPE"]}
            for row in result
        ]

    cursor.close()
    conn.close()

    return jsonify(schemas)
