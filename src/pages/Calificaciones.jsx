    import { useState } from "react";
    import { cursos } from "../data/datos";
    import "../styles/Calificaciones.css";

    function Calificaciones() {
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
        <div className="calificaciones-container">
        <h2>Registro de Calificaciones</h2>

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
                Nombre evaluacion:{" "}
                <input
                    type="text"
                    placeholder="Ej: Prueba 1"
                    className="input-evaluacion"
                />
                </span>
            </div>
            <table>
                <thead>
                <tr>
                    <th style={{ width: "60px" }}>N°</th>
                    <th>RUN / RUT</th>
                    <th>Apellido Paterno</th>
                    <th>Nombres</th>
                    <th className="check">Calificación</th>
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
                    <td>{alumno.nombre}</td>
                    <td className="check">
                        <label className="switch">
                        <input type="text" />
                        </label>
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>
            <button className="btn-tab btn-guardar">Guardar Calificación</button>
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
