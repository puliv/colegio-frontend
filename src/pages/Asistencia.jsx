    import { useState } from "react";
    import { cursos } from "../data/datos";
    import "../styles/Asistencia.css";

    function Asistencia() {
    const [cursoSeleccionado, setCursoSeleccionado] = useState(cursos[0]?.id);

    const cursoActivo = cursos.find(
    (c) => String(c.id) === String(cursoSeleccionado),
    );

    const alumnosOrdenados = cursoActivo?.alumnos
    ? [...cursoActivo.alumnos].sort((a, b) =>
    a.apellidoPaterno.localeCompare(b.apellidoPaterno),
    )
    : [];

    return (
    <div className="asistencia-container">
        <h2>Registro de Asistencia</h2>

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

        {cursoActivo ? (
        <div className="tabla-contenedor">
            <div className="tabla-header-info">
            <h3>Alumnos del {cursoActivo.nombre}</h3>
            <span className="badge-contador">
                Fecha: {new Date().toLocaleDateString("es-CL", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric"
                })}
            </span>
            </div>
            <table>
            <thead>
                <tr>
                <th style={{ width: "60px" }}>N°</th>
                <th>RUN / RUT</th>
                <th>Apellido Paterno</th>
                <th>Apellido Materno</th>
                <th>Nombres</th>
                <th className="check">Asistencia</th>
                </tr>
            </thead>
            <tbody>
                {alumnosOrdenados.map((alumno, index) => (
                <tr key={alumno.id}>
                    <td>
                    <strong>{index + 1}</strong>
                    </td>
                    <td className="text-run">{alumno.run}</td>
                    <td>{alumno.apellidoPaterno}</td>
                    <td>{alumno.apellidoMaterno}</td>
                    <td>{alumno.nombre}</td>
                    <td className="check">
                    <label className="switch">
                        <input type="checkbox" />
                        <span className="slider"></span>
                    </label>
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
            <button className="btn-tab btn-guardar">Guardar Asistencia</button>
        </div>
        ) : (
        <div className="alert alert-warning text-center">
            No se encontraron alumnos o no se ha seleccionado un curso válido.
        </div>
        )}
    </div>
    );
    }

    export default Asistencia;
