from flask import Flask, render_template


app = Flask(__name__)


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/autorizacion-tratamiento-datos.html")
def autorizacion():
    return render_template("autorizacion-tratamiento-datos.html")


@app.route("/politica-tratamiento-datos.html")
def ploitica():
    return render_template("politica-tratamiento-datos.html")


@app.route("/aviso-privacidad.html")
def aviso():
    return render_template("aviso-privacidad.html")


app.run()
