import { useState, useEffect } from "react";
import axios from "axios";
import PropTypes from "prop-types";
import "../styles/Calificaciones.css";

function Calificaciones({ setSeccion }) {
  const [cursos, setCursos] = useState([]);
  const [cursoSeleccionado, setCursoSeleccionado] = useState(null);
  const [alumnos, setAlumnos] = useState([]);
  const [loadingCursos, setLoadingCursos] = useState(false);
  const [loadingAlumnos, setLoadingAlumnos] = useState(false);
  const [error, setError] = useState("");
  const url = import.meta.env.VITE_API_URL;

  // Estados para el flujo de nueva calificación
  const [modoCrear, setModoCrear] = useState(false);
  const [nombreEvaluacion, setNombreEvaluacion] = useState("");
  const [nuevasNotas, setNuevasNotas] = useState({});

  // refreshKey: incrementarlo fuerza un nuevo fetch de alumnos sin setState en el effect
  const [refreshKey, setRefreshKey] = useState(0);

  //  Helper: obtener token ─
  const getToken = () =>
    localStorage.getItem("token") || localStorage.getItem("Token");

  //  1. Obtener cursos al montar el componente ──
  useEffect(() => {
    const obtenerCursos = async () => {
      try {
        setLoadingCursos(true);
        setError("");
        const token = getToken();

        if (!token) {
          setError("No se encontró una sesión activa.");
          return;
        }

        const response = await axios.get(url + "/api/v1/cursos", {
          headers: { Authorization: `Bearer ${token.trim()}` },
        });

        const listaCursos =
          response.data?.cursos ||
          (Array.isArray(response.data) ? response.data : []);

        setCursos(listaCursos);

        if (listaCursos.length > 0) {
          setCursoSeleccionado(listaCursos[0].id);
        }
      } catch (err) {
        console.error("Error al obtener cursos:", err);
        setError("Error al cargar la lista de cursos.");
      } finally {
        setLoadingCursos(false);
      }
    };

    obtenerCursos();
  }, []);

  //  2. Fetch de alumnos — se dispara cuando cambia el curso o refreshKey ──
  // La función vive DENTRO del effect: no hay setState llamado desde afuera
  useEffect(() => {
    if (!cursoSeleccionado) return;

    const obtenerAlumnos = async () => {
      try {
        setLoadingAlumnos(true);
        const token = getToken();

        const response = await axios.get(
          import.meta.env
            .VITE_API_URL + `/api/v1/estudiantes?cursoId=${cursoSeleccionado}`,
          { headers: { Authorization: `Bearer ${token?.trim()}` } }
        );

        const listaAlumnos =
          response.data?.alumnos ||
          (Array.isArray(response.data) ? response.data : []);

        const ordenados = [...listaAlumnos].sort((a, b) =>
          (a.apellido || "").localeCompare(b.apellido || "")
        );

        setAlumnos(ordenados);
      } catch (err) {
        console.error("Error al obtener alumnos:", err);
        setAlumnos([]);
      } finally {
        setLoadingAlumnos(false);
      }
    };

    obtenerAlumnos();
  }, [cursoSeleccionado, refreshKey]); // refreshKey permite forzar re-fetch desde handlers

  // Cambia de curso y resetea el formulario — todo en el handler, no en un effect
  const handleCambiarCurso = (cursoId) => {
    setModoCrear(false);
    setNombreEvaluacion("");
    setNuevasNotas({});
    setCursoSeleccionado(cursoId);
  };

  const handleNotaChange = (alumnoId, valor) => {
    setNuevasNotas((prev) => ({ ...prev, [alumnoId]: valor }));
  };

  //  Guardar calificaciones
  const guardarCalificaciones = async () => {
    if (!nombreEvaluacion.trim()) {
      alert("Por favor, ingrese el nombre de la evaluación (Ej: Prueba 1).");
      return;
    }

    const notasFiltradas = Object.keys(nuevasNotas).filter(
      (id) => nuevasNotas[id].trim() !== ""
    );

    if (notasFiltradas.length === 0) {
      alert("Por favor, ingrese al menos una calificación antes de guardar.");
      return;
    }

    try {
      const token = getToken();

      const payload = {
        cursoId: cursoSeleccionado,
        nombreEvaluacion: nombreEvaluacion.trim(),
        calificaciones: notasFiltradas.map((alumnoId) => ({
          estudianteId: Number(alumnoId),
          nota: Number.parseFloat(nuevasNotas[alumnoId].replace(",", ".")),
        })),
      };

      const response = await axios.post(
        url + "/api/v1/calificaciones",
        payload,
        { headers: { Authorization: `Bearer ${token?.trim()}` } }
      );

      if (response.data.ok) {
        alert(response.data.msg || "Calificaciones guardadas con éxito.");

        // Limpiar formulario
        setModoCrear(false);
        setNombreEvaluacion("");
        setNuevasNotas({});

        // Forzar re-fetch incrementando refreshKey — no hay setState dentro del effect
        setRefreshKey((k) => k + 1);
      }
    } catch (err) {
      console.error("Error al guardar calificaciones:", err);
      const mensajeError =
        err.response?.data?.msg ||
        "Error al guardar las calificaciones en la base de datos.";
      alert(mensajeError);
    }
  };

  //  Render
  const cursoActivo = cursos.find((c) => c.id === cursoSeleccionado);

  if (loadingCursos) {
    return (
      <div className="calificaciones-container text-center">
        <p>🔄 Cargando asignaturas...</p>
      </div>
    );
  }

  return (
    <div className="calificaciones-container">
      {/* CONTENEDOR FLUIDO DEL ENCABEZADO */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h2 style={{ margin: 0 }}>Registro de Calificaciones</h2>

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

      {/* Tabs de cursos */}
      <div className="selector-bar">
        {cursos.map((curso) => (
          <button
            key={curso.id}
            className={`btn-tab ${cursoSeleccionado === curso.id ? "active" : ""}`}
            onClick={() => handleCambiarCurso(curso.id)}
          >
            {curso.nombre}
          </button>
        ))}
      </div>

      {cursoSeleccionado && !error ? (
        <div className="tabla-contenedor">
          {/* Encabezado */}
          <div
            className="tabla-header-info"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h3>Alumnos del {cursoActivo?.nombre || "Cargando..."}</h3>

            {!modoCrear ? (
              <button
                className="btn-tab active"
                onClick={() => setModoCrear(true)}
              >
                ➕ Agregar Calificación
              </button>
            ) : (
              <div className="evaluacion-input-container">
                <span className="badge-contador">
                  Nombre evaluación:{" "}
                  <input
                    type="text"
                    placeholder="Ej: Prueba 1"
                    className="input-evaluacion"
                    value={nombreEvaluacion}
                    onChange={(e) => setNombreEvaluacion(e.target.value)}
                  />
                </span>
                <button
                  className="btn-tab"
                  style={{
                    backgroundColor: "#dc3545",
                    marginLeft: "10px",
                    color: "#fff",
                  }}
                  onClick={() => {
                    setModoCrear(false);
                    setNombreEvaluacion("");
                    setNuevasNotas({});
                  }}
                >
                  Cancelar
                </button>
              </div>
            )}
          </div>

          {/* Tabla de alumnos */}
          {loadingAlumnos ? (
            <p className="text-center py-3">Buscando estudiantes...</p>
          ) : alumnos.length > 0 ? (
            <>
              <table>
                <thead>
                  <tr>
                    <th style={{ width: "60px" }}>N°</th>
                    <th>RUN / RUT</th>
                    <th>Apellido Paterno</th>
                    <th>Nombres</th>
                    {!modoCrear ? (
                      <th>Calificaciones Registradas</th>
                    ) : (
                      <th className="check">Ingresar Nota</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {alumnos.map((alumno, index) => (
                    <tr key={alumno.id}>
                      <td>
                        <strong>{index + 1}</strong>
                      </td>
                      <td className="text-run">{alumno.rut}</td>
                      <td>{alumno.apellido}</td>
                      <td>{alumno.nombre}</td>

                      {!modoCrear ? (
                        <td>
                          <div
                            className="notas-lista-render"
                            style={{
                              display: "flex",
                              gap: "5px",
                              flexWrap: "wrap",
                            }}
                          >
                            {alumno.calificaciones &&
                            alumno.calificaciones.length > 0 ? (
                              alumno.calificaciones.map((n) => (
                                <span
                                  key={n.id}
                                  className="badge-nota"
                                  title={n.descripcion || n.nombreEvaluacion}
                                  style={{
                                    padding: "4px 8px",
                                    backgroundColor: "#e9ecef",
                                    borderRadius: "4px",
                                    fontWeight: "bold",
                                  }}
                                >
                                  {n.nota}
                                </span>
                              ))
                            ) : (
                              <span
                                style={{
                                  color: "#6c757d",
                                  fontStyle: "italic",
                                  fontSize: "0.9em",
                                }}
                              >
                                Sin notas registradas
                              </span>
                            )}
                          </div>
                        </td>
                      ) : (
                        <td className="check">
                          <input
                            type="text"
                            placeholder="7.0"
                            style={{ width: "60px", textAlign: "center" }}
                            value={nuevasNotas[alumno.id] || ""}
                            onChange={(e) =>
                              handleNotaChange(alumno.id, e.target.value)
                            }
                          />
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>

              {modoCrear && (
                <button
                  className="btn-tab btn-guardar"
                  onClick={guardarCalificaciones}
                >
                  Guardar Calificación
                </button>
              )}
            </>
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

export default Calificaciones;

Calificaciones.propTypes = {
  setSeccion: PropTypes.func.isRequired, // Especifica que es una función obligatoria
};
