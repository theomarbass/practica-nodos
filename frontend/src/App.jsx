import { useState, useEffect } from "react";

// ==========================================
// 1. EL MOLDE REUTILIZABLE
// ==========================================

// ==========================================
// 1. EL MOLDE REUTILIZABLE
// ==========================================
function TarjetaNodo(props) {
  return (
    <div style={{ 
      border: "1px solid #444", padding: "10px", margin: "8px 0", 
      borderRadius: "4px", display: "flex", justifyContent: "space-between", alignItems: "center" 
    }}>
      <div>
        <strong>Host IP:</strong> {props.ip} | <strong>Servicio:</strong> {props.servicio}
      </div>
      <div>
        <button 
          onClick={props.alHacerClickEditar} // <--- Nuevo gatillo para editar
          style={{ background: "#4da6ff", color: "white", border: "none", padding: "5px 10px", borderRadius: "3px", cursor: "pointer", marginRight: "10px" }}
        >
          Editar
        </button>
        <button 
          onClick={props.alHacerClick} // <--- El gatillo de eliminar que ya tenías
          style={{ background: "#ff4d4d", color: "white", border: "none", padding: "5px 10px", borderRadius: "3px", cursor: "pointer" }}
        >
          Eliminar
        </button>
      </div>
    </div>
  );
}

// ==========================================
// 2. EL CENTRO DE CONTROL (TU APP DE REACT)
// ==========================================
export default function App() {
  
  // Memoria reactiva inicial (arranca vacía)
  const [nodos, setNodos] = useState([]);

  // =========================================================
  // EL DESPERTADOR: Se ejecuta solo una vez al abrir la página
  // =========================================================
  useEffect(() => {
    async function cargarNodosIniciales() {
      // 1. Pide los datos al servidor Node.js
      const respuesta = await fetch("http://localhost:3001/api/nodos");
      
      // 2. Convierte el texto JSON en un arreglo de JavaScript
      const nodosDeLaBaseDatos = await respuesta.json();

      // 3. Sobreescribe la memoria vacía con los datos reales
      setNodos(nodosDeLaBaseDatos);
    }

    cargarNodosIniciales();
  }, []); // <-- El arreglo vacío indica que solo se ejecuta al nacer el componente
  // =========================================================

  // =========================================================
  // LA FUNCIÓN DE GUARDAR
  // =========================================================
  async function registrarNodo(formData) {
    const ipCapturada = formData.get("direccionIp");
    const servicioCapturado = formData.get("tipoServicio");

    const paquete = {
      hostIp: ipCapturada,
      servicioNombre: servicioCapturado
    };

    const respuesta = await fetch("http://localhost:3001/api/nodos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(paquete) 
    });

    const nodoOficial = await respuesta.json();
    setNodos((prev) => [...prev, nodoOficial]);
  }
  // =========================================================

  // =========================================================
  // TU NUEVA FUNCIÓN DE ELIMINAR (EL CAMIÓN DE DEMOLICIÓN)
  // =========================================================

  async function dispararEliminacion(idParaBorrar) {
    // 1. El camión sale hacia Node.js
    await fetch(`http://localhost:3001/api/nodos/${idParaBorrar}`, {
      method: "DELETE"
    });

    // 2. Usamos el "control remoto" para borrarlo también de la pantalla
    // Esto filtra la lista: deja pasar a todos los que NO sean el ID borrado.
    setNodos((listaAnterior) => listaAnterior.filter(nodo => nodo.id !== idParaBorrar));
  }

// =========================================================
  // TU NUEVA FUNCIÓN DE EDITAR (EL CAMIÓN DE ACTUALIZACIÓN)
  // =========================================================
  async function dispararEdicion(idParaEditar) {
    // 1. Le pedimos al usuario el nuevo texto
    const nuevoServicio = window.prompt("Escribe el nuevo nombre del servicio:");
    
    // Si el usuario cancela o lo deja vacío, detenemos la función
    if (!nuevoServicio) return; 

    // 2. El camión sale hacia Node.js
    await fetch(`http://localhost:3001/api/nodos/${idParaEditar}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ servicio_nombre: nuevoServicio })
    });

    // 3. Actualizamos la memoria de React (la pantalla)
    // Recorremos la lista: si es el nodo que editamos, le cambiamos el nombre. Si no, lo dejamos igual.
    setNodos((listaAnterior) => 
      listaAnterior.map(nodo => 
        nodo.id === idParaEditar ? { ...nodo, servicio_nombre: nuevoServicio } : nodo
      )
    );
  }





  return (
    <div style={{ padding: "25px", fontFamily: "sans-serif", maxWidth: "600px" }}>
      <h2>🌐 Monitoreo de Nodos Activos</h2>

      <div style={{ background: "#f4f4f4", padding: "15px", marginBottom: "20px" }}>
        <form action={registrarNodo} style={{ display: "flex", gap: "10px" }}>
          <input 
            type="text" 
            name="direccionIp" 
            placeholder="IP (ej: 10.0.0.5)" 
            required 
          />
          <input 
            type="text" 
            name="tipoServicio" 
            placeholder="Servicio (ej: Docker)" 
            required 
          />
          <button type="submit">Agregar Nodo</button>
        </form>
      </div>

      <h3>Nodos Registrados</h3>
      
      {nodos.map((nodo) => {
        return(
          <TarjetaNodo
            key={nodo.id}
            ip={nodo.host_ip}
            servicio={nodo.servicio_nombre}
            // RETO FINAL: ¿Cómo conectas la propiedad 'alHacerClick' del molde
            // con la función 'dispararEliminacion' pasándole el 'nodo.id'?
            alHacerClick={() => dispararEliminacion(nodo.id) } 
          />    
        )
      })}
    </div>
  );
}