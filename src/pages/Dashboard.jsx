import { useState } from "react";
import { useNavigate } from "react-router-dom"; // 👈 Import agregado
import "../styles/Dashboard.css";
import Cursos from "./Cursos";

function Dashboard() {
    const nombreProfesor = "Benjamín";
    const [seccion, setSeccion] = useState("inicio");
    const navigate = useNavigate();

    const handleLogout = () => {
        navigate("/");
    };

    return (
        <div className="dashboard-container">
            {/* --- MENÚ LATERAL (SIDEBAR) --- */}
            <div className="sidebar">
                <div className="sidebar-top">
                    <h2 className="sidebar-title">Menú</h2>
                    <button onClick={() => setSeccion("inicio")} className={seccion === "inicio" ? "active" : ""}>Inicio</button>
                    <button onClick={() => setSeccion("cursos")} className={seccion === "cursos" ? "active" : ""}>Ver Cursos</button>
                    <button onClick={() => setSeccion("asistencia")} className={seccion === "asistencia" ? "active" : ""}>Registrar Asistencia</button>
                    <button onClick={() => setSeccion("calificaciones")} className={seccion === "calificaciones" ? "active" : ""}>Subir Calificaciones</button>
                    <button onClick={() => setSeccion("anotaciones")} className={seccion === "anotaciones" ? "active" : ""}>Anotaciones</button>
                </div>

                <div className="sidebar-footer">
                    <button onClick={handleLogout} className="btn-logout">
                        Cerrar Sesión
                    </button>
                </div>
            </div>

            {/* --- CONTENIDO PRINCIPAL DERECHO --- */}
            <div className="dashboard-content">

                {seccion === "inicio" && (
                    <div className="inicio-container">

                        <div className="welcome-card">
                            <h1>Hola, Profesor {nombreProfesor}</h1>
                            <p>Bienvenido al sistema de Libro de Clases Digital. Este es el estado general de sus cursos para hoy.</p>
                        </div>

                        <div className="stats-grid">
                            <div className="stat-box azul">
                                <h3>4</h3>
                                <p>Cursos Asignados</p>
                                <span className="stat-footer">8°A, 8°B, 8°C, 8°D</span>
                            </div>
                            <div className="stat-box verde">
                                <h3>40</h3>
                                <p>Total Alumnos</p>
                                <span className="stat-footer">Matrícula oficial</span>
                            </div>
                            <div className="stat-box naranja">
                                <h3>94.2%</h3>
                                <p>Asistencia Promedio</p>
                                <span className="stat-footer">Asistencia mensual</span>
                            </div>
                            <div className="stat-box rojo">
                                <h3>5</h3>
                                <p>Alertas Críticas</p>
                                <span className="stat-footer">Alumnos en riesgo</span>
                            </div>
                        </div>

                        <div className="dashboard-panels-grid">

                            <div className="panel-box shadow-sm">
                                <h3>⚠️ Alertas Tempranas (Convivencia y Notas)</h3>
                                <ul className="alert-list">
                                    <li className="alert-item critica">
                                        <strong>María Soto (8°A)</strong>: Asistencia bajó al 83% (Riesgo de repitencia).
                                    </li>
                                    <li className="alert-item advertencia">
                                        <strong>Pedro Rojas (8°B)</strong>: Registró 1 anotación negativa esta semana.
                                    </li>
                                    <li className="alert-item critica">
                                        <strong>Lucas Jara (8°A)</strong>: Promedio actual deficiente en Matemáticas (3.8).
                                    </li>
                                    <li className="alert-item medica">
                                        <strong>Juan Pérez (8°A)</strong>: Recordatorio: Condición médica (Alergia alimentaria).
                                    </li>
                                </ul>
                            </div>

                            <div className="panel-box shadow-sm">
                                <h3>📅 Próximos Eventos y Evaluaciones</h3>
                                <ul className="event-list">
                                    <li>
                                        <span className="event-date">18 May</span>
                                        <p><strong>8°A</strong> - Prueba Global de Historia</p>
                                    </li>
                                    <li>
                                        <span className="event-date">20 May</span>
                                        <p><strong>8°C</strong> - Entrega de Guía Talleres</p>
                                    </li>
                                    <li>
                                        <span className="event-date">25 May</span>
                                        <p>🎓 Reunión general de profesores (16:00 hrs)</p>
                                    </li>
                                </ul>
                            </div>
                        </div>

                    </div>
                )}

                {seccion === "cursos" && <Cursos />}
                {seccion === "asistencia" && <div><h2>Sección Asistencia (En desarrollo)</h2></div>}
                {seccion === "calificaciones" && <div><h2>Sección Calificaciones (En desarrollo)</h2></div>}
                {seccion === "anotaciones" && <div><h2>Sección Anotaciones (En desarrollo)</h2></div>}

            </div>
        </div>
    );
}

export default Dashboard;