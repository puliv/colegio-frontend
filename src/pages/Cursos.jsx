import { useState } from "react";
import { cursos } from "../data/datos"; 
import "../styles/Cursos.css";

function Cursos() {
    // Inicializa con el ID del primer curso de la lista
    const [cursoSeleccionado, setCursoSeleccionado] = useState(cursos[0]?.id);

    // Encuentra el curso activo comparando los IDs de forma segura como Texto
    const cursoActivo = cursos.find(
        (c) => String(c.id) === String(cursoSeleccionado)
    );

    // Ordena alfabéticamente a los alumnos por Apellido Paterno
    const alumnosOrdenados = cursoActivo?.alumnos
        ? [...cursoActivo.alumnos].sort((a, b) =>
                a.apellidoPaterno.localeCompare(b.apellidoPaterno)
            )
        : [];

    return (
        <div className="modulo-card">
            <h2>Nómina Oficial de Cursos</h2>
            <p>Seleccione un curso del menú para desplegar la lista de alumnos.</p>
            
            {/* Barra superior de pestañas */}
            <div className="selector-bar">
                {cursos && cursos.map(curso => (
                    <button 
                        key={curso.id} 
                        className={`btn-tab ${cursoSeleccionado === curso.id ? "active" : ""}`}
                        onClick={() => setCursoSeleccionado(curso.id)}
                    >
                        {curso.nombre}
                    </button>
                ))}
            </div>

            {/* Renderizado condicional de la tabla si existe el curso */}
            {cursoActivo ? (
                <div className="tabla-contenedor">
                    <div className="tabla-header-info">
                        <h3>Alumnos del {cursoActivo.nombre}</h3>
                        <span className="badge-contador">Total: {alumnosOrdenados.length} alumnos</span>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th style={{ width: "60px" }}>N°</th>
                                <th>RUN / RUT</th>
                                <th>Apellido Paterno</th>
                                <th>Apellido Materno</th>
                                <th>Nombres</th>
                                <th>Edad</th>
                            </tr>
                        </thead>
                        <tbody>
                            {alumnosOrdenados.map((alumno, index) => (
                                <tr key={alumno.id}>
                                    <td><strong>{index + 1}</strong></td>
                                    <td className="text-run">{alumno.run}</td>
                                    <td>{alumno.apellidoPaterno}</td>
                                    <td>{alumno.apellidoMaterno}</td>
                                    <td>{alumno.nombre}</td>
                                    <td>{alumno.edad} años</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="alert alert-warning text-center">
                    No se encontraron alumnos o no se ha seleccionado un curso válido.
                </div>
            )}
        </div>
    );
}

export default Cursos;