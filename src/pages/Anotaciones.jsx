import { useState, useEffect } from "react";
import axios from "axios";
import PropTypes from "prop-types";
import "../styles/Calificaciones.css"; // Reutiliza tus estilos globales de tablas y tarjetas

function Anotaciones({ setSeccion }) {
  const [cursos, setCursos] = useState([]);
  const [cursoSeleccionado, setCursoSeleccionado] = useState(null);
  const [alumnos, setAlumnos] = useState([]);
  const [loadingCursos, setLoadingCursos] = useState(false);
  const [loadingAlumnos, setLoadingAlumnos] = useState(false);
  const [error, setError] = useState("");
  const url = import.meta.env.VITE_API_URL;

  // Estados para el formulario de nueva anotación
  const [alumnoSeleccionado, setAlumnoSeleccionado] = useState("");
  const [tipoAnotacion, setTipoAnotacion] = useState("Negativa");
  const [descripcion, setDescripcion] = useState("");
  const [guardando, setGuardando] = useState(false);

  // 1. Obtener los cursos del profesor al cargar el componente
  useEffect(() => {
    const obtenerCursos = async () => {
      try {
        setLoadingCursos(true);
        setError("");
        const token =
          localStorage.getItem("token") || localStorage.getItem("Token");

        if (!token) {
          setError("No se encontró una sesión activa.");
          return;
        }

        const response = await axios.get(
          url + "/api/v1/cursos",
          {
            headers: { Authorization: `Bearer ${token.trim()}` },
          }
        );

        const listaCursos =
          response.data?.cursos ||
          (Array.isArray(response.data) ? response.data : []);
        setCursos(listaCursos);

        if (listaCursos.length > 0) {
          setCursoSeleccionado(listaCursos[0].id);
        }
      } catch (err) {
        console.error("Error al obtener cursos en anotaciones:", err);
        setError("Error al cargar la lista de cursos.");
      } finally {
        setLoadingCursos(false);
      }
    };

    obtenerCursos();
  }, []);

  // 2. Obtener los estudiantes cada vez que cambie el curso seleccionado
  useEffect(() => {
    if (!cursoSeleccionado) return;

    const obtenerAlumnos = async () => {
      try {
        setLoadingAlumnos(true);
        // Resetear el formulario al cambiar de curso
        setAlumnoSeleccionado("");
        setDescripcion("");

        const token =
          localStorage.getItem("token") || localStorage.getItem("Token");

        const response = await axios.get(
          import.meta.env
            .VITE_API_URL + `/api/v1/estudiantes?cursoId=${cursoSeleccionado}`,
          {
            headers: { Authorization: `Bearer ${token?.trim()}` },
          }
        );

        const listaAlumnos =
          response.data?.alumnos ||
          (Array.isArray(response.data) ? response.data : []);

        const ordenados = [...listaAlumnos].sort((a, b) => {
          const apellidoA = a.apellido || "";
          const apellidoB = b.apellido || "";
          return apellidoA.localeCompare(apellidoB);
        });

        setAlumnos(ordenados);
      } catch (err) {
        console.error("Error al obtener alumnos en anotaciones:", err);
        setAlumnos([]);
      } finally {
        setLoadingAlumnos(false);
      }
    };

    obtenerAlumnos();
  }, [cursoSeleccionado]);

  // 3. Enviar la anotación al Backend
  const guardarAnotacionAxios = async (e) => {
    e.preventDefault();

    if (!alumnoSeleccionado) {
      alert("Por favor, seleccione un alumno.");
      return;
    }
    if (!descripcion.trim()) {
      alert("Por favor, ingrese el detalle de la anotación.");
      return;
    }

    try {
      setGuardando(true);
      const token =
        localStorage.getItem("token") || localStorage.getItem("Token");

      const payload = {
        alumnoId: Number(alumnoSeleccionado),
        tipo: tipoAnotacion,
        descripcion: descripcion.trim(),
        fecha: new Date().toISOString().split("T")[0], // YYYY-MM-DD automático
      };

      await axios.post(url + "/api/v1/anotaciones", payload, {
        headers: { Authorization: `Bearer ${token?.trim()}` },
      });

      alert("Anotación registrada con éxito.");
      // Limpiar texto de la descripción dejando el alumno seleccionado por si hay que ponerle otra
      setDescripcion("");
    } catch (err) {
      console.error("Error al guardar anotación:", err);
      alert(
        err.response?.data?.msg ||
          "Error en el servidor al registrar la anotación."
      );
    } finally {
      setGuardando(false);
    }
  };

  const cursoActivo = cursos.find((c) => c.id === cursoSeleccionado);

  if (loadingCursos) {
    return (
      <div className="calificaciones-container text-center">
        <p>🔄 Cargando asignaturas desde MySQL...</p>
      </div>
    );
  }

  return (
    <div className="calificaciones-container">
      {/* 👑 ENCABEZADO CON BOTÓN DE REGRESO DESIGN FLUID */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h2 style={{ margin: 0 }}>Registro de Anotaciones</h2>
        <button
          onClick={() => setSeccion("inicio")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            backgroundColor: "#1e2d4a",
            color: "#ffffff",
            border: "none",
            padding: "10px 18px",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "0.95em",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            transition: "background-color 0.2s",
          }}
          onMouseOver={(e) =>
            (e.currentTarget.style.backgroundColor = "#2c3e66")
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.backgroundColor = "#1e2d4a")
          }
        >
          <i className="bi bi-arrow-left"></i> Volver al Inicio
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Selector de Cursos (Tabs superiores) */}
      <div className="selector-bar">
        {cursos?.map((curso) => (
          <button
            key={curso.id}
            className={`btn-tab ${cursoSeleccionado === curso.id ? "active" : ""}`}
            onClick={() => setCursoSeleccionado(curso.id)}
          >
            {curso.nombre}
          </button>
        ))}
      </div>

      {cursoSeleccionado && !error ? (
        <div className="tabla-contenedor" style={{ padding: "25px" }}>
          <div className="tabla-header-info" style={{ marginBottom: "20px" }}>
            <h3>Nueva Hoja de Vida - {cursoActivo?.nombre || "Cargando..."}</h3>
          </div>

          {loadingAlumnos ? (
            <p className="text-center py-3">Buscando estudiantes...</p>
          ) : alumnos.length > 0 ? (
            <form
              onSubmit={guardarAnotacionAxios}
              style={{ display: "flex", flexDirection: "column", gap: "15px" }}
            >
              {/* Selector de Alumno */}
              <div
                style={{ display: "flex", flexDirection: "column", gap: "5px" }}
              >
                <label style={{ fontWeight: "bold", color: "#333" }}>
                  Seleccionar Estudiante:
                </label>
                <select
                  className="input-evaluacion"
                  style={{ width: "100%", height: "40px", padding: "0 10px" }}
                  value={alumnoSeleccionado}
                  onChange={(e) => setAlumnoSeleccionado(e.target.value)}
                >
                  <option value="">
                    -- Seleccione un alumno de la lista --
                  </option>
                  {alumnos.map((alumno) => (
                    <option key={alumno.id} value={alumno.id}>
                      {alumno.apellido}, {alumno.nombre} ({alumno.rut})
                    </option>
                  ))}
                </select>
              </div>

              {/* Selector de Tipo de Anotación */}
              <div
                style={{ display: "flex", flexDirection: "column", gap: "5px" }}
              >
                <label style={{ fontWeight: "bold", color: "#333" }}>
                  Tipo de Observación:
                </label>
                <div style={{ display: "flex", gap: "15px" }}>
                  <label
                    style={{
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                    }}
                  >
                    <input
                      type="radio"
                      name="tipo"
                      value="Negativa"
                      checked={tipoAnotacion === "Negativa"}
                      onChange={() => setTipoAnotacion("Negativa")}/>
                    🔴 Negativa / Incumplimiento
                  </label>
                  <label
                    style={{
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                    }}
                  >
                    <input
                      type="radio"
                      name="tipo"
                      value="Positiva"
                      checked={tipoAnotacion === "Positiva"}
                      onChange={() => setTipoAnotacion("Positiva")}
                    />
                    🟢 Positiva / Destacado
                  </label>
                </div>
              </div>

              {/* Caja de Texto (Detalle) */}
              <div
                style={{ display: "flex", flexDirection: "column", gap: "5px" }}
              >
                <label style={{ fontWeight: "bold", color: "#333" }}>
                  Descripción del Hecho:
                </label>
                <textarea
                  className="input-evaluacion"
                  rows="4"
                  placeholder="Escriba aquí los detalles detallados del comportamiento o situación..."
                  style={{
                    width: "100%",
                    padding: "10px",
                    height: "auto",
                    resize: "vertical",
                  }}
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                />
              </div>

              {/* Botón de Envíos */}
              <button
                type="submit"
                className="btn-tab btn-guardar"
                style={{
                  marginTop: "10px",
                  width: "fit-content",
                  alignSelf: "flex-end",
                }}
                disabled={guardando}
              >
                {guardando
                  ? "Registrando..."
                  : "Guardar Observación en Hoja de Vida"}
              </button>
            </form>
          ) : (
            <div className="alert alert-warning text-center mt-3">
              No se encontraron alumnos matriculados para este curso.
            </div>
          )}
        </div>
      ) : (
        <div className="alert alert-warning text-center">
          No se encontraron alumnos o no se ha seleccionado un curso válido.
        </div>
      )}
    </div>
  );
}

export default Anotaciones;

Anotaciones.propTypes = {
  setSeccion: PropTypes.func.isRequired, // Especifica que es una función obligatoria
};
