const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Configuración de la conexión a tu PostgreSQL local
const pool = new Pool({
  user: "postgres",            // Tu usuario de PostgreSQL
  host: "localhost",
  database: "nodos",        // O el nombre de la BD donde creaste la tabla 'nodos'
  password: "1377",     // Coloca aquí la contraseña real de tu PostgreSQL
  port: 5432,
});

// Endpoint GET: Leer todos los nodos
app.get("/api/nodos", async (req, res) => {
  try {
    const resultado = await pool.query(
      "SELECT id, host_ip, servicio_nombre FROM nodos ORDER BY id ASC"
    );
    res.json(resultado.rows);
  } catch (error) {
    console.error("Error al consultar PostgreSQL:", error);
    res.status(500).json({ error: "Fallo en la consulta" });
  }
});

// Endpoint POST: Registrar un nodo nuevo
app.post("/api/nodos", async (req, res) => {
  try {
    const { hostIp, servicioNombre } = req.body;
    const query = `
      INSERT INTO nodos (host_ip, servicio_nombre) 
      VALUES ($1, $2) 
      RETURNING id, host_ip, servicio_nombre
    `;
    const resultado = await pool.query(query, [hostIp, servicioNombre]);
    res.status(201).json(resultado.rows[0]);
  } catch (error) {
    console.error("Error al insertar en PostgreSQL:", error);
    res.status(500).json({ error: "Fallo en la inserción" });
  }
});

// Endpoint DELETE: Eliminar un nodo específico
app.delete("/api/nodos/:id", async (req, res) => {
  try {
    // 1. El mesero extrae el número de ID directamente desde la URL
    const idParaBorrar = req.params.id;

    // 2. RETO: La orden SQL para PostgreSQL
    const query = "DELETE FROM nodos WHERE id = $1";
    
    // 3. Ejecutamos la orden en la base de datos
    await pool.query(query, [idParaBorrar]);
    
    res.json({ mensaje: "Registro eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar en PostgreSQL:", error);
    res.status(500).json({ error: "Fallo al eliminar" });
  }
});

// Endpoint PUT: Actualizar el servicio de un nodo
app.put("/api/nodos/:id", async (req, res) => {
  try {
    // 1. Extraemos el comodín (ID) de la URL y el nuevo servicio de la caja (body)
    const idNodo = req.params.id;
    const nuevoServicio = req.body.servicio_nombre; 

    // ==========================================
    // RETO 1: Escribe la orden SQL exacta para cambiar la columna servicio_nombre
    // usando las sillas reservadas $1 y $2
    // ==========================================
    const query = "UPDATE nodos SET servicio_nombre = $1 WHERE id = $2";

    // ==========================================
    // RETO 2: Asigna los dos invitados en el orden correcto 
    // para que coincidan con tus sillas $1 y $2
    // ==========================================
    await pool.query(query, [nuevoServicio, idNodo]);
    
    res.json({ mensaje: "Nodo actualizado exitosamente" });
  } catch (error) {
    console.error("Error al actualizar PostgreSQL:", error);
    res.status(500).json({ error: "Fallo al actualizar" });
  }
});





// Iniciar el servidor en el puerto 3001
app.listen(3001, () => {
  console.log("Puente PostgreSQL corriendo en http://localhost:3001");
});