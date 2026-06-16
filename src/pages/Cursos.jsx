import { useState, useEffect } from "react";
import axios from "axios";
import "../styles/Cursos.css";

function Cursos() {
  const [cursos, setCursos] = useState([]);
  const [cursoSeleccionado, setCursoSeleccionado] = useState(null);
  const [alumnos, setAlumnos] = useState([]);
  const [loadingCursos, setLoadingCursos] = useState(false);
  const [loadingAlumnos, setLoadingAlumnos] = useState(false);
  const [error, setError] = useState("");

  // 1. Obtener la lista de cursos del profesor desde el backend
  useEffect(() => {
    const obtenerCursos = async () => {
      try {
        setLoadingCursos(true);
        setError("");

        // Intenta recuperar el token ignorando posibles problemas de mayúsculas/minúsculas
        const token =
          localStorage.getItem("token") || localStorage.getItem("Token");

        if (!token) {
          setError(
            "No se encontró una sesión activa. Inicie sesión nuevamente.",
          );
          return;
        }

        const response = await axios.get(
          "http://localhost:3000/api/v1/cursos",
          {
            headers: { Authorization: `Bearer ${token.trim()}` },
          },
        );

        // Valida la estructura del backend de forma estricta
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

  // 2. Cada vez que cambie el curso seleccionado, traer sus alumnos específicos
  useEffect(() => {
    if (!cursoSeleccionado) return;

    const obtenerAlumnos = async () => {
      try {
        setLoadingAlumnos(true);
        const token =
          localStorage.getItem("token") || localStorage.getItem("Token");

        const response = await axios.get(
          `http://localhost:3000/api/v1/estudiantes?cursoId=${cursoSeleccionado}`,
          {
            headers: { Authorization: `Bearer ${token?.trim()}` },
          },
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
        console.error("Error al obtener alumnos:", err);
        setAlumnos([]);
      } finally {
        setLoadingAlumnos(false);
      }
    };

    obtenerAlumnos();
  }, [cursoSeleccionado]);

  const cursoActivo = cursos.find((c) => c.id === cursoSeleccionado);

  if (loadingCursos) {
    return (
      <div className="modulo-card text-center">
        <p>🔄 Cargando nómina oficial desde MySQL...</p>
      </div>
    );
  }

  return (
    <div className="modulo-card">
      <h2>Nómina Oficial de Cursos</h2>
      <p>
        Seleccione un curso del menú para desplegar la lista de alumnos activos.
      </p>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="selector-bar">
        {cursos.map((curso) => (
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
        <div className="tabla-contenedor">
          <div className="tabla-header-info">
            <h3>Alumnos del {cursoActivo?.nombre || "Cargando..."}</h3>
            <span className="badge-contador">
              Total: {alumnos.length} alumnos
            </span>
          </div>

          {loadingAlumnos ? (
            <p className="text-center py-3">Buscando estudiantes...</p>
          ) : alumnos.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th style={{ width: "60px" }}>N°</th>
                  <th>RUT / RUN</th>
                  <th>Apellido</th>
                  <th>Nombres</th>
                  <th>Asignación</th>
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
                    <td>
                      <span
                        className="badge-contador"
                        style={{ backgroundColor: "#28a745" }}
                      >
                        Activo
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="alert alert-warning text-center mt-3">
              No se encontraron alumnos matriculados para este curso en la base
              de datos.
            </div>
          )}
        </div>
      ) : (
        <div className="alert alert-warning text-center mt-3">
          No hay cursos disponibles para este profesor.
        </div>
      )}
    </div>
  );
}

export default Cursos;
