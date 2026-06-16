import { useState } from "react";
import "../styles/Cursos.css";

function Cursos({ alumnos = [], cargando }) {
  // 1. Obtenemos de forma dinámica los cursos únicos que existen en tu base de datos
  // Esto evitará que muestres pestañas vacías. Ej: ["4to Medio A"]
  const listaCursosExistentes = [...new Set(alumnos.map((a) => a.curso))];

  // Inicializa la pestaña con el primer curso real encontrado, o un string vacío si aún no carga
  const [cursoSeleccionado, setCursoSeleccionado] = useState(
    listaCursosExistentes[0] || "",
  );

  // Si cambió la data y el estado inicial estaba vacío, forzamos a seleccionar el primero
  if (!cursoSeleccionado && listaCursosExistentes.length > 0) {
    setCursoSeleccionado(listaCursosExistentes[0]);
  }

  // 2. Filtramos de la lista global de MySQL solo a los alumnos del curso activo
  const alumnosDelCurso = alumnos.filter(
    (alumno) => alumno.curso === cursoSeleccionado,
  );

  // 3. Los ordenamos alfabéticamente por su Apellido (tal como lo tenías pensado)
  const alumnosOrdenados = [...alumnosDelCurso].sort((a, b) =>
    a.apellido.localeCompare(b.apellido),
  );

  if (cargando) {
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

      {/* Barra superior de pestañas dinámica basada en tu Base de Datos */}
      <div className="selector-bar">
        {listaCursosExistentes.map((curso, index) => (
          <button
            key={index}
            className={`btn-tab ${cursoSeleccionado === curso ? "active" : ""}`}
            onClick={() => setCursoSeleccionado(curso)}
          >
            {curso}
          </button>
        ))}
      </div>

      {/* Renderizado de la tabla con los datos reales de tu API */}
      {cursoSeleccionado ? (
        <div className="tabla-contenedor">
          <div className="tabla-header-info">
            <h3>Alumnos del {cursoSeleccionado}</h3>
            <span className="badge-contador">
              Total: {alumnosOrdenados.length} alumnos
            </span>
          </div>
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
              {alumnosOrdenados.map((alumno, index) => (
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
        </div>
      ) : (
        <div className="alert alert-warning text-center">
          No se encontraron alumnos matriculados en la base de datos.
        </div>
      )}
    </div>
  );
}

export default Cursos;

