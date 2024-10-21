from flask import (
    Flask,
    render_template,
    request,
    redirect,
    url_for,
    flash,
    jsonify,
    session
)
import psycopg2
from psycopg2.extras import RealDictCursor
from flask_cors import CORS
from datetime import datetime
import os
from werkzeug.utils import secure_filename
import pandas as pd
from sqlalchemy import create_engine
import plotly.express as px
import json
import plotly


app = Flask(__name__)
CORS(app)
app.secret_key = "your_secret_key"
UPLOAD_FOLDER = "uploads"
ALLOWED_EXTENSIONS = {"csv", "txt", "xlsx"}
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER


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
        host=os.environ["N2LHOST"],
        database=os.environ["DBN2L"],
        user=os.environ["N2LUSERPAGE"],
        password=os.environ["N2LPASSWORDPAGE"],
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
    cur.execute(
        """
                SELECT sk_id as id,
                "name"||' '||lastname AS name
                FROM parameters.employees
                order by 2 asc
                """
    )
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

    return jsonify({"task_id": task_id, "message": "Task created successfully"}), 201


@app.route("/tasks", methods=["GET"])
def get_tasks():
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute(
        """
            SELECT t.id,
                t.task_name,
                t.status,
                u."name"||' '||u.lastname as assigned_to
            FROM kanban.tasks t
            LEFT JOIN parameters.employees u ON t.assigned_to = u.sk_id
            """
    )
    tasks = cur.fetchall()
    cur.close()
    return jsonify(tasks)


@app.route("/tasks/<int:task_id>", methods=["PUT"])
def update_task(task_id):
    data = request.get_json()
    description = data.get("description")
    priority = data.get("priority")
    user_points = data.get("user_points")
    new_status = data.get("status")
    conn = get_db_connection()
    with conn.cursor() as cur:
        cur.execute(
            """
            UPDATE kanban.tasks
            SET description = %s,
                    priority = %s,
                    user_points = %s,
                    status = %s,
                    updated_at = NOW()
            WHERE id = %s
        """,
            (description, priority, user_points, new_status, task_id),
        )
        conn.commit()

    return jsonify(
        {
            "message": "Task updated successfully",
            "task_id": task_id,
            "new_status": new_status,
        }
    )


def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


@app.route('/demo', methods=['GET', 'POST'])
def upload_file():
    plot_html = None
    columns = []
    graphJSON = None
    categorical_columns = []
    numerical_columns = []
    DATABASE_URI = f'postgresql://{os.environ["N2LUSERPAGE"]}:{os.environ["N2LPASSWORDPAGE"]}@{os.environ["N2LHOST"]}/{os.environ["DBN2L"]}'
    engine = create_engine(DATABASE_URI)

    if request.method == 'POST':
        if 'file' in request.files:
            file = request.files['file']
            if file and allowed_file(file.filename):
                filename = secure_filename(file.filename)
                file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                file.save(file_path)

                # Cargar el archivo en un dataframe de pandas
                if filename.endswith('.csv') or filename.endswith('.txt'):
                    df = pd.read_csv(file_path)
                elif filename.endswith('.xlsx'):
                    df = pd.read_excel(file_path)

                # Forzar el nombre de la tabla a minúsculas para evitar problemas con PostgreSQL
                table_name = os.path.splitext(filename)[0].lower()

                # Guardar el nombre de la tabla en la sesión
                session['table_name'] = table_name

                # Cargar el dataframe en PostgreSQL (crea la tabla si no existe)
                df.to_sql(table_name, engine, if_exists='replace', index=False)

                # Separar las columnas en categóricas y numéricas
                categorical_columns = df.select_dtypes(include=['object', 'category']).columns.tolist()
                numerical_columns = df.select_dtypes(include=['number']).columns.tolist()

                flash(f'File successfully uploaded and data loaded into table "{table_name}"')

        elif request.form.get('x_axis') and request.form.get('y_axis') and request.form.get('chart_type'):
            # Recuperar el nombre de la tabla desde la sesión
            table_name = session.get('table_name')

            # Asegurarse de que exista un nombre de tabla válido
            if not table_name:
                flash('Error: Table name not found.')
                return redirect('/demo')

            # Escapar el nombre de la tabla por si contiene mayúsculas o caracteres especiales
            escaped_table_name = f'"{table_name}"'

            # Obtener los datos de la tabla en PostgreSQL
            df = pd.read_sql(f'SELECT * FROM {escaped_table_name}', engine)

            # Tipo de gráfico seleccionado
            chart_type = request.form['chart_type']

            # Columnas seleccionadas
            x_axis = request.form['x_axis']
            y_axis = request.form['y_axis']
            aggregation = request.form.get('aggregation')

            # Aplicar agregación si es necesario
            if aggregation and y_axis in numerical_columns:
                if aggregation == 'sum':
                    df = df.groupby(x_axis)[y_axis].sum().reset_index()
                elif aggregation == 'mean':
                    df = df.groupby(x_axis)[y_axis].mean().reset_index()
                elif aggregation == 'count':
                    df = df.groupby(x_axis)[y_axis].count().reset_index()

            # Generar el gráfico con base en las selecciones del usuario
            if chart_type == 'scatter':
                fig = px.scatter(df, x=x_axis, y=y_axis, title=f'Scatter Plot of {x_axis} vs {y_axis}')
            elif chart_type == 'bar':
                fig = px.bar(df, x=x_axis, y=y_axis, title=f'Bar Plot of {x_axis} vs {y_axis}')
            elif chart_type == 'line':
                fig = px.line(df, x=x_axis, y=y_axis, title=f'Line Plot of {x_axis} vs {y_axis}')

            # Convertir el gráfico a JSON para pasarlo al front-end
            graphJSON = json.dumps(fig, cls=plotly.utils.PlotlyJSONEncoder)

            # Obtener las columnas categóricas y numéricas para mantener el formulario visible
            categorical_columns = df.select_dtypes(include=['object', 'category']).columns.tolist()
            numerical_columns = df.select_dtypes(include=['number']).columns.tolist()

    return render_template('demo.html', categorical_columns=categorical_columns, numerical_columns=numerical_columns, graphJSON=graphJSON)


if __name__ == "__main__":
    if not os.path.exists(UPLOAD_FOLDER):
        os.makedirs(UPLOAD_FOLDER)
    app.run(host="0.0.0.0", port=5000, debug=False)
