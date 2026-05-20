import { useState, useEffect } from "react";
import { getAllStudents } from "../services/api";
import "../styles/Cursos.css";

function Cursos() {
    const [estudiantes, setEstudiantes] = useState([]);
    const [cursoSeleccionado, setCursoSeleccionado] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getAllStudents()
            .then((res) => {
                setEstudiantes(res.data);
                if (res.data.length > 0) {
                    setCursoSeleccionado(res.data[0].grade);
                }
                setLoading(false);
            })
            .catch((err) => {
                console.error("Error al obtener estudiantes:", err);
                setLoading(false);
            });
    }, []);

    // Obtener cursos únicos
    const cursosUnicos = [...new Set(estudiantes.map((e) => e.grade))];

    // Filtrar alumnos por curso seleccionado y ordenar alfabéticamente
    const alumnosFiltrados = estudiantes
        .filter((e) => e.grade === cursoSeleccionado)
        .sort((a, b) => a.lastName.localeCompare(b.lastName));

    if (loading) return <div className="modulo-card"><p>Cargando estudiantes...</p></div>;

    return (
        <div className="modulo-card">
            <h2>Nómina Oficial de Cursos</h2>
            <p>Seleccione un curso del menú para desplegar la lista de alumnos.</p>

            <div className="selector-bar">
                {cursosUnicos.map((curso) => (
                    <button
                        key={curso}
                        className={`btn-tab ${cursoSeleccionado === curso ? "active" : ""}`}
                        onClick={() => setCursoSeleccionado(curso)}
                    >
                        {curso}
                    </button>
                ))}
            </div>

            {alumnosFiltrados.length > 0 ? (
                <div className="tabla-contenedor">
                    <div className="tabla-header-info">
                        <h3>Alumnos del {cursoSeleccionado}</h3>
                        <span className="badge-contador">Total: {alumnosFiltrados.length} alumnos</span>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th style={{ width: "60px" }}>N°</th>
                                <th>RUT</th>
                                <th>Apellido Paterno</th>
                                <th>Nombres</th>
                                <th>Curso</th>
                            </tr>
                        </thead>
                        <tbody>
                            {alumnosFiltrados.map((alumno, index) => (
                                <tr key={alumno.id}>
                                    <td><strong>{index + 1}</strong></td>
                                    <td className="text-run">{alumno.rut}</td>
                                    <td>{alumno.lastName}</td>
                                    <td>{alumno.firstName}</td>
                                    <td>{alumno.grade}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="alert alert-warning text-center">
                    No se encontraron alumnos para este curso.
                </div>
            )}
        </div>
    );
}

export default Cursos;