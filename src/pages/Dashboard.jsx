import { useState } from "react";

import "../styles/Dashboard.css";

import Cursos from "./Cursos";
import Asistencia from "./Asistencia";
import Calificaciones from "./Calificaciones";
import Anotaciones from "./Anotaciones";

function Dashboard() {
    const nombreProfesor = "Benjamín";
    const [seccion, setSeccion] = useState("inicio");

    return (
        <div className="dashboard-container">
            <div className="sidebar">
                <h2 className="sidebar-title">Menú</h2>
                <button onClick={() => setSeccion("inicio")}>Inicio</button>
                <button onClick={() => setSeccion("cursos")}>Ver Cursos</button>
                <button onClick={() => setSeccion("asistencia")}>Registrar Asistencia</button>
                <button onClick={() => setSeccion("calificaciones")}>Subir Calificaciones</button>
                <button onClick={() => setSeccion("anotaciones")}>Anotaciones</button>
            </div>

            <div className="dashboard-content">
                {seccion === "inicio" && (
                    <div className="card">
                        <h1>Hola, Profesor {nombreProfesor} </h1>
                        <p>Bienvenido al sistema de Libro de Clases Digital.</p>
                    </div>
                )}

                {seccion === "cursos" && <Cursos />}
                {seccion === "asistencia" && <Asistencia />}
                {seccion === "calificaciones" && <Calificaciones />}
                {seccion === "anotaciones" && <Anotaciones />}
            </div>
        </div>
    );
}

export default Dashboard;