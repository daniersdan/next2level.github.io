const express = require("express");
const { Pool } = require("pg");
const path = require("path"); // Importa el módulo 'path'

const app = express();
const port = 3000;

const pool = new Pool({
  user: "postgres",
  host: "next2leveldb.cqn3neunxdth.us-east-2.rds.amazonaws.com",
  database: "Next2Level",
  password: "Daniers1222*",
  port: 5432,
  ssl: { rejectUnauthorized: false },
});

app.use(express.urlencoded({ extended: true }));

// Middleware para servir archivos estáticos desde la carpeta 'Web_page'
app.use(express.static(path.join(__dirname, "Web_page")));

app.post("/insert", async (req, res) => {
  try {
    const { name, email, phone, Message } = req.body;
    const query =
      "INSERT INTO web_page.mensajes (nombre, correo , telefono , mensaje) VALUES ($1, $2, $3, $4)";
    const values = [name, email, phone, Message];

    await pool.query(query, values);
    res.redirect("/index.html#header");
  } catch (error) {
    console.error("Error al insertar datos:", error);
    res.status(500).send("Error al insertar datos en la base de datos.");
  }
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
