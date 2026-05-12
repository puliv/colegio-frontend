import "../styles/Dashboard.css";

function Dashboard() {

    const nombreProfesor = "Benjamín";

    return (
        <div className="dashboard-container">

            {/* SIDEBAR IZQUIERDO */}
            <div className="sidebar">

                <h2 className="sidebar-title">Menú</h2>

                <button>Ver Cursos</button>
                <button>Registrar Asistencia</button>
                <button>Subir Calificaciones</button>
                <button>Anotaciones</button>
                <button>Reportes</button>
                <button>Mensajes</button>

            </div>

            {/* CONTENIDO PRINCIPAL */}
            <div className="dashboard-content">

                <h1>Hola, Profesor {nombreProfesor} 👋</h1>

                <p>
                    Bienvenido al sistema de Libro de Clases Digital.
                    Aquí puedes gestionar tus cursos, asistencia y evaluaciones.
                </p>

            </div>

        </div>
    );
}

export default Dashboard;