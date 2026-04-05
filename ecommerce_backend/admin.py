from __future__ import annotations

import re
from datetime import date, datetime
from decimal import Decimal, InvalidOperation

import bcrypt
import mysql.connector
from flask import abort, jsonify, request

from . import app, get_db


# Whitelist of tables that can be queried
ADMIN_DASHBOARD_ALLOWED_TABLES = [
    "users",
    "discount_codes",
    "products",
    "tags",
    "orders",
]

# Blacklist of columns that cannot be queried (read)
ADMIN_DASHBOARD_DISALLOWED_COLUMNS = {"users": ("password",)}

# Columns never writable via generic admin API (use dedicated flows if needed)
ADMIN_WRITE_BLOCKED_COLUMNS = {
    "users": (),
}

# --- helpers ---


def _parse_enum_values(column_type: str | None) -> list[str] | None:
    """Parse MySQL COLUMN_TYPE like enum('a','b') into ['a', 'b']."""
    if not column_type:
        return None
    ct = column_type.strip()
    m = re.match(r"^enum\s*\((.*)\)\s*$", ct, re.IGNORECASE | re.DOTALL)
    if not m:
        return None
    inner = m.group(1).strip()
    if not inner:
        return None
    values: list[str] = []
    i = 0
    n = len(inner)
    while i < n:
        while i < n and inner[i] in " \t\n\r,":
            i += 1
        if i >= n:
            break
        if inner[i] != "'":
            return None
        i += 1
        chunk: list[str] = []
        while i < n:
            c = inner[i]
            if c == "\\" and i + 1 < n:
                chunk.append(inner[i + 1])
                i += 2
                continue
            if c == "'":
                if i + 1 < n and inner[i + 1] == "'":
                    chunk.append("'")
                    i += 2
                    continue
                i += 1
                break
            chunk.append(c)
            i += 1
        values.append("".join(chunk))
    return values if values else None


def _table_allowed(table_name: str) -> None:
    if table_name not in ADMIN_DASHBOARD_ALLOWED_TABLES:
        abort(403, description=f"Table '{table_name}' is not allowed")


def _fetch_column_meta(cursor, table_name: str) -> list[dict]:
    cursor.execute(
        """
        SELECT COLUMN_NAME AS COLUMN_NAME, DATA_TYPE AS DATA_TYPE,
               COLUMN_KEY AS COLUMN_KEY, EXTRA AS EXTRA,
               IS_NULLABLE AS IS_NULLABLE, COLUMN_DEFAULT AS COLUMN_DEFAULT
        FROM information_schema.columns
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = %s
        ORDER BY ORDINAL_POSITION
        """,
        (table_name,),
    )
    return cursor.fetchall()


def _primary_key_column(meta: list[dict]) -> str | None:
    pri = [c["COLUMN_NAME"] for c in meta if c.get("COLUMN_KEY") == "PRI"]
    return pri[0] if len(pri) == 1 else None


def _is_auto_increment(col: dict) -> bool:
    return col.get("EXTRA") and "auto_increment" in col["EXTRA"].lower()


def _coerce_value(value, col: dict, table_name: str, col_name: str):
    """Convert JSON-friendly values to types MySQL connector accepts."""
    nullable = col.get("IS_NULLABLE") == "YES"
    data_type = (col.get("DATA_TYPE") or "").lower()

    if value is None or value == "":
        if nullable:
            return None
        abort(400, description=f"Column '{col_name}' cannot be null")

    if table_name == "users" and col_name == "password":
        if not isinstance(value, str):
            abort(400, description="password must be a string")
        return bcrypt.hashpw(value.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

    if data_type in ("tinyint",):
        if isinstance(value, bool):
            return 1 if value else 0
        s = str(value).strip().lower()
        if s in ("true", "yes"):
            return 1
        if s in ("false", "no"):
            return 0
        try:
            return int(value)
        except (TypeError, ValueError):
            abort(400, description=f"Invalid tinyint for '{col_name}'")

    if data_type in ("bit",):
        if isinstance(value, bool):
            return b"\x01" if value else b"\x00"
        return b"\x01" if int(value) else b"\x00"

    if data_type in ("int", "integer", "smallint", "mediumint", "bigint"):
        try:
            return int(value)
        except (TypeError, ValueError):
            abort(400, description=f"Invalid integer for '{col_name}'")

    if data_type in ("decimal", "numeric"):
        try:
            return Decimal(str(value))
        except (InvalidOperation, ValueError):
            abort(400, description=f"Invalid decimal for '{col_name}'")

    if data_type in ("float", "double"):
        return float(value)

    if data_type in ("datetime", "timestamp"):
        if isinstance(value, (int, float)):
            return datetime.fromtimestamp(value)
        s = str(value).strip()
        if s.endswith("Z"):
            s = s[:-6] + "+00:00" if "+" not in s[:-1] else s.replace("Z", "+00:00")
        try:
            return datetime.fromisoformat(s.replace("Z", "+00:00"))
        except ValueError:
            abort(400, description=f"Invalid datetime for '{col_name}'")

    if data_type == "date":
        if isinstance(value, (int, float)):
            return datetime.fromtimestamp(value).date()
        try:
            return date.fromisoformat(str(value)[:10])
        except ValueError:
            abort(400, description=f"Invalid date for '{col_name}'")

    if data_type in ("json",):
        return value

    return str(value)


def _writable_columns(meta: list[dict], table_name: str) -> list[dict]:
    blocked = set(ADMIN_WRITE_BLOCKED_COLUMNS.get(table_name, ()))
    out = []
    for c in meta:
        name = c["COLUMN_NAME"]
        if name in blocked:
            continue
        ex = (c.get("EXTRA") or "").lower()
        if "generated" in ex or "virtual" in ex:
            continue
        out.append(c)
    return out


@app.route("/multi-table-data", methods=["GET"])
def get_tables_rows():

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

    data = {}

    for table_name in requested_tables:
        cursor.execute(
            f"""
            SELECT *
            FROM {table_name}
            """,
        )
        result = cursor.fetchall()
        data[table_name] = [
            {
                col: v
                for col, v in row.items()
                if (  # excludes blacklisted columns
                    col not in ADMIN_DASHBOARD_DISALLOWED_COLUMNS[table_name]
                    if table_name in ADMIN_DASHBOARD_DISALLOWED_COLUMNS
                    else True
                )
            }
            for row in result
        ]

    cursor.close()
    conn.close()

    return jsonify(data)


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
            SELECT COLUMN_NAME, DATA_TYPE, COLUMN_TYPE, COLUMN_KEY, EXTRA,
                   IS_NULLABLE
            FROM information_schema.columns
            WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = %s
            ORDER BY ORDINAL_POSITION
            """,
            (table_name,),
        )
        result = cursor.fetchall()
        # Include all columns (e.g. users.password) for forms; row data still omits secrets in GET multi-table-data.
        built: list[dict] = []
        for row in result:
            col_type = row.get("COLUMN_TYPE") or ""
            enum_vals = _parse_enum_values(col_type)
            entry = {
                "sqlName": row["COLUMN_NAME"],
                "sqlType": row["DATA_TYPE"],
                "columnKey": row["COLUMN_KEY"] or "",
                "extra": row["EXTRA"] or "",
                "isNullable": row["IS_NULLABLE"] == "YES",
            }
            if enum_vals is not None:
                entry["enumValues"] = enum_vals
            built.append(entry)
        schemas[table_name] = built

    cursor.close()
    conn.close()

    return jsonify(schemas)


@app.route("/admin/table/<table_name>/row", methods=["POST"])
def admin_insert_row(table_name: str):
    _table_allowed(table_name)
    payload = request.get_json()
    if not payload or not isinstance(payload, dict):
        abort(400, description="JSON object body required")

    conn = get_db()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    cursor = conn.cursor(dictionary=True)
    meta = _fetch_column_meta(cursor, table_name)
    pk = _primary_key_column(meta)
    if not pk:
        abort(500, description="Table has no single-column primary key")

    writable = {c["COLUMN_NAME"]: c for c in _writable_columns(meta, table_name)}
    insert_cols = []
    insert_vals = []

    for key, raw in payload.items():
        if key not in writable:
            abort(400, description=f"Unknown or non-writable column: {key}")
        col = writable[key]
        if _is_auto_increment(col) and key == pk:
            continue
        insert_cols.append(key)
        insert_vals.append(_coerce_value(raw, col, table_name, key))

    if not insert_cols:
        abort(400, description="No columns to insert")

    placeholders = ", ".join(["%s"] * len(insert_cols))
    col_list = ", ".join(f"`{c}`" for c in insert_cols)
    sql = f"INSERT INTO `{table_name}` ({col_list}) VALUES ({placeholders})"

    try:
        cursor.execute(sql, insert_vals)
        conn.commit()
        new_id = cursor.lastrowid
    except mysql.connector.Error as e:
        conn.rollback()
        cursor.close()
        conn.close()
        return jsonify({"error": str(e)}), 400

    cursor.close()
    conn.close()
    return jsonify({"message": "Row created", "id": new_id}), 201


@app.route("/admin/table/<table_name>/row/<int:row_id>", methods=["PATCH"])
def admin_update_row(table_name: str, row_id: int):
    _table_allowed(table_name)
    payload = request.get_json()
    if not payload or not isinstance(payload, dict):
        abort(400, description="JSON object body required")

    conn = get_db()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    cursor = conn.cursor(dictionary=True)
    meta = _fetch_column_meta(cursor, table_name)
    pk = _primary_key_column(meta)
    if not pk:
        abort(500, description="Table has no single-column primary key")

    writable = {c["COLUMN_NAME"]: c for c in _writable_columns(meta, table_name)}

    sets = []
    values = []
    for key, raw in payload.items():
        if key == pk:
            abort(400, description="Cannot change primary key via this API")
        if key not in writable:
            abort(400, description=f"Unknown or non-writable column: {key}")
        col = writable[key]
        if table_name == "users" and key == "password":
            if raw is None or (isinstance(raw, str) and raw.strip() == ""):
                continue
            if not isinstance(raw, str):
                abort(400, description="password must be a string")
            sets.append("`password` = %s")
            values.append(
                bcrypt.hashpw(raw.encode("utf-8"), bcrypt.gensalt()).decode("utf-8"),
            )
            continue
        sets.append(f"`{key}` = %s")
        values.append(_coerce_value(raw, col, table_name, key))

    if not sets:
        abort(400, description="No columns to update")

    values.append(row_id)
    sql = f"UPDATE `{table_name}` SET {', '.join(sets)} WHERE `{pk}` = %s"

    try:
        cursor.execute(sql, values)
        conn.commit()
        affected = cursor.rowcount
    except mysql.connector.Error as e:
        conn.rollback()
        cursor.close()
        conn.close()
        return jsonify({"error": str(e)}), 400

    cursor.close()
    conn.close()

    if affected:
        return jsonify({"message": "Row updated"})
    return jsonify({"error": "Row not found"}), 404


@app.route("/admin/table/<table_name>/row/<int:row_id>", methods=["DELETE"])
def admin_delete_row(table_name: str, row_id: int):
    _table_allowed(table_name)

    conn = get_db()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    cursor = conn.cursor(dictionary=True)
    meta = _fetch_column_meta(cursor, table_name)
    pk = _primary_key_column(meta)
    if not pk:
        abort(500, description="Table has no single-column primary key")

    try:
        cursor.execute(
            f"DELETE FROM `{table_name}` WHERE `{pk}` = %s",
            (row_id,),
        )
        conn.commit()
        affected = cursor.rowcount
    except mysql.connector.Error as e:
        conn.rollback()
        cursor.close()
        conn.close()
        return jsonify({"error": str(e)}), 400

    cursor.close()
    conn.close()

    if affected:
        return jsonify({"message": "Row deleted"})
    return jsonify({"error": "Row not found"}), 404
