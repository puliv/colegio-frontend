import { useState, useEffect } from "react";
import axios from "axios";
import "../styles/Calificaciones.css";

function Calificaciones() {
const [cursos, setCursos] = useState([]);
const [cursoSeleccionado, setCursoSeleccionado] = useState(null);
const [alumnos, setAlumnos] = useState([]);
const [loadingCursos, setLoadingCursos] = useState(false);
const [loadingAlumnos, setLoadingAlumnos] = useState(false);
const [error, setError] = useState("");
const [nombreEvaluacion, setNombreEvaluacion] = useState("");

// 1. Obtener los cursos dinámicamente desde el Backend
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
        "http://localhost:3000/api/v1/cursos",
        {
        headers: { Authorization: `Bearer ${token.trim()}` },
        },
    );

    const listaCursos =
        response.data?.cursos ||
        (Array.isArray(response.data) ? response.data : []);
    setCursos(listaCursos);

    if (listaCursos.length > 0) {
        setCursoSeleccionado(listaCursos[0].id);
    }
    } catch (err) {
    console.error("Error al obtener cursos en calificaciones:", err);
    setError("Error al cargar la lista de cursos.");
    } finally {
    setLoadingCursos(false);
    }
};

obtenerCursos();
}, []);

// 2. Obtener estudiantes del curso seleccionado
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

    // Ordenar alfabéticamente por apellido (mapeado a tu base de datos)
    const ordenados = [...listaAlumnos].sort((a, b) => {
        const apellidoA = a.apellido || "";
        const apellidoB = b.apellido || "";
        return apellidoA.localeCompare(apellidoB);
    });

    setAlumnos(ordenados);
    } catch (err) {
    console.error("Error al obtener alumnos en calificaciones:", err);
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
    <div className="calificaciones-container text-center">
    <p>🔄 Cargando asignaturas desde MySQL...</p>
    </div>
);
}

return (
<div className="calificaciones-container">
    <h2>Registro de Calificaciones</h2>

    {error && <div className="alert alert-danger">{error}</div>}

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
    <div className="tabla-contenedor">
        <div className="tabla-header-info">
        <h3>Alumnos del {cursoActivo?.nombre || "Cargando..."}</h3>
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
        </div>

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
                    <th className="check">Calificación</th>
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
                        <td className="check">
                        <label className="switch">
                            <input
                            type="text"
                            placeholder="7.0"
                            style={{ width: "50px", textAlign: "center" }}
                            />
                        </label>
                        </td>
                    </tr>
                    ))}
                </tbody>
            </table>
            <button className="btn-tab btn-guardar">
                Guardar Calificación
            </button>
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
