import { useEffect, useState } from "react";
import "../styles/Dashboard.css";
import Cursos from "./Cursos";
import Asistencia from "./Asistencia";
import Calificaciones from "./Calificaciones";
import colegioApi from "../api/colegioApi";

function Dashboard() {
  const nombreProfesor = "Benjamín";
  const [seccion, setSeccion] = useState("inicio");

  const [estudiantes, setEstudiantes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarEstudiantes = async () => {
      try {
        console.log("Iniciando la carga de estudiantes...");
        const response = await colegioApi.get("/estudiantes");

        console.log(
          "Estudiantes cargados con éxito desde el backend:",
          response.data
        );

        // OJO AQUÍ: Tu backend devuelve la data en 'response.data.alumnos'
        setEstudiantes(response.data.alumnos || []);
      } catch (error) {
        console.error(
          "❌ Error al conectar con el backend de estudiantes:",
          error
        );

        if (error.response?.status === 401) {
          console.warn(
            "⚠️ No estás autorizado. Revisa si el token JWT del profesor es válido."
          );
        }
      } finally {
        setLoading(false);
      }
    };

    cargarEstudiantes();
  }, []);

  return (
    <div className="dashboard-container">
      <div className="sidebar">
        <div className="sidebar-top">
          <h2 className="sidebar-title">Menú</h2>
          <button
            onClick={() => setSeccion("inicio")}
            className={seccion === "inicio" ? "active" : ""}
          >
            Inicio
          </button>
          <button
            onClick={() => setSeccion("cursos")}
            className={seccion === "cursos" ? "active" : ""}
          >
            Ver Cursos
          </button>
          <button
            onClick={() => setSeccion("asistencia")}
            className={seccion === "asistencia" ? "active" : ""}
          >
            Registrar Asistencia
          </button>
          <button
            onClick={() => setSeccion("calificaciones")}
            className={seccion === "calificaciones" ? "active" : ""}
          >
            Subir Calificaciones
          </button>
          <button
            onClick={() => setSeccion("anotaciones")}
            className={seccion === "anotaciones" ? "active" : ""}
          >
            Anotaciones
          </button>
        </div>
      </div>

      {/* --- CONTENIDO PRINCIPAL DERECHO --- */}
      <div className="dashboard-content">
        {seccion === "inicio" && (
          <div className="inicio-container">
            <div className="welcome-card">
              <h1>Bienvenido, Profesor {nombreProfesor}</h1>
              <p>
                Aquí podrás gestionar tus cursos, registrar asistencias, subir
                calificaciones y mucho más.
              </p>
            </div>

            <div className="stats-grid">
              <div className="stat-box azul">
                <h3>4</h3>
                <p>Cursos Asignados</p>
                <span className="stat-footer">8°A, 8°B, 8°C, 8°D</span>
              </div>
              <div className="stat-box verde">
                {/* 🔄 Renderizamos dinámicamente el largo de la lista real */}
                <h3>{loading ? "..." : estudiantes.length}</h3>
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
                <p>Promedio Curso</p>
                <span className="stat-footer">????</span>
              </div>
            </div>
          </div>
        )}

        {seccion === "cursos" && (
          <Cursos alumnos={estudiantes} cargando={loading} />
        )}

        {seccion === "asistencia" && <Asistencia />}
        {seccion === "calificaciones" && <Calificaciones />}
        {seccion === "anotaciones" && (
          <div>
            <h2>Sección Anotaciones (En desarrollo)</h2>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
