// src/components/Cursos.jsx
import { useState } from "react";
import { cursos } from "../data/datos"; // Ajustado a tu ruta
import "../styles/cursos.css";

function Cursos() {
    const [cursoSeleccionado, setCursoSeleccionado] = useState(cursos[0]?.id);

    const cursoActivo = cursos.find(c => c.id === Number(cursoSeleccionado));

    // Ordenar alumnos alfabéticamente por Apellido Paterno para la lista
    const alumnosOrdenados = cursoActivo 
        ? [...cursoActivo.alumnos].sort((a, b) => a.apellidoPaterno.localeCompare(b.apellidoPaterno))
        : [];

    return (
        <div className="modulo-card">
            <h2>Nómina Oficial de Cursos</h2>
            <p>Seleccione un curso del menú para desplegar la lista de alumnos.</p>
            
            <div className="selector-bar">
                {cursos.map(curso => (
                    <button 
                        key={curso.id} 
                        className={`btn-tab ${cursoSeleccionado === curso.id ? "active" : ""}`}
                        onClick={() => setCursoSeleccionado(curso.id)}
                    >
                        {curso.nombre}
                    </button>
                ))}
            </div>

            {cursoActivo && (
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
            )}
        </div>
    );
}

export default Cursos;