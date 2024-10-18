from flask import (
    Flask,
    render_template,
    request,
    redirect,
    url_for,
    flash,
    jsonify,
)
import psycopg2
from psycopg2.extras import RealDictCursor
from flask_cors import CORS
from datetime import datetime

app = Flask(__name__)
CORS(app)
app.secret_key = "your_secret_key"


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/autorizacion-tratamiento-datos.html")
def autorizacion():
    return render_template("autorizacion-tratamiento-datos.html")


@app.route("/politica-tratamiento-datos.html")
def politica():
    return render_template("politica-tratamiento-datos.html")


@app.route("/aviso-privacidad.html")
def aviso():
    return render_template("aviso-privacidad.html")


# Conexión a la base de datos PostgreSQL
def get_db_connection():
    conn = psycopg2.connect(
        host="next2level.c1ieaicow1bf.us-east-2.rds.amazonaws.com",
        database="next2level",
        user="postgres",
        password="q9Z5!cEiPB*ic6RYFs^",
    )
    return conn


@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        username = request.form["username"]
        password = request.form["password"]
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute(
            """
            SELECT *
            FROM public.profile
            WHERE username = %s AND password = %s""",
            (username, password),
        )
        user = cur.fetchone()
        cur.close()
        conn.close()
        if user:
            return redirect(url_for("kanban"))
        else:
            flash("Usuario o contraseña incorrectos")
            return redirect(url_for("login"))
    return render_template("login.html")


@app.route("/kanban")
def kanban():
    return render_template("kanban.html")


@app.route("/users", methods=["GET"])
def get_users():
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute("""
                SELECT sk_id as id,
                "name"||' '||lastname AS name
                FROM parameters.employees
                order by 2 asc
                """)
    users = cur.fetchall()
    cur.close()
    return jsonify(users)


@app.route("/tasks", methods=["POST"])
def create_task():
    data = request.json
    task_name = data["task_name"]
    assigned_to = data["assigned_to"]
    status = "To Do"
    created_at = datetime.now()
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute(
        """
        INSERT INTO kanban.tasks
                (task_name, assigned_to, status, created_at, updated_at)
        VALUES (%s, %s, %s, %s, %s) RETURNING id;
        """,
        (task_name, assigned_to, status, created_at, created_at),
    )
    task_id = cur.fetchone()[0]
    conn.commit()
    cur.close()

    return jsonify({"task_id": task_id,
                    "message": "Task created successfully"}), 201


@app.route("/tasks", methods=["GET"])
def get_tasks():
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute("""
            SELECT t.id,
                t.task_name,
                t.status,
                u."name"||' '||u.lastname as assigned_to
            FROM kanban.tasks t
            LEFT JOIN parameters.employees u ON t.assigned_to = u.sk_id
            """)
    tasks = cur.fetchall()
    cur.close()
    return jsonify(tasks)


@app.route('/tasks/<int:task_id>', methods=['PUT'])
def update_task(task_id):
    data = request.get_json()
    description = data.get('description')
    priority = data.get('priority')
    user_points = data.get('user_points')
    new_status = data.get('status')
    conn = get_db_connection()
    with conn.cursor() as cur:
        cur.execute('''
            UPDATE kanban.tasks
            SET description = %s,
                    priority = %s,
                    user_points = %s,
                    status = %s,
                    updated_at = NOW()
            WHERE id = %s
        ''', (description, priority, user_points, new_status, task_id))
        conn.commit()

    return jsonify({"message": "Task updated successfully",
                    "task_id": task_id, "new_status": new_status})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=False)
