import { useEffect, useState } from "react";
import "../styles/Dashboard.css";
import Cursos from "./Cursos";
import Asistencia from "./Asistencia";
import Calificaciones from "./Calificaciones";
import colegioApi from "../api/colegioApi";
import Anotaciones from "./Anotaciones";

function Dashboard() {
  const nombreProfesor = "Benjamín";
  const [seccion, setSeccion] = useState("inicio");
  const [estudiantes, setEstudiantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [promedioCurso, setPromedioCurso] = useState("0.0");

  useEffect(() => {
    const cargarEstudiantes = async () => {
      try {
        console.log("Iniciando la carga de estudiantes...");
        const response = await colegioApi.get("/estudiantes");
        const listaAlumnos = response.data.alumnos || [];

        console.log(
          "Estudiantes cargados con éxito desde el backend:",
          response.data
        );
        setEstudiantes(response.data.alumnos || []);

        // 🆕 Extraemos todas las notas en un solo arreglo plano usando flatMap
        const todasLasNotas = listaAlumnos.flatMap((alumno) => {
          // Verificamos si existe en minúscula o en mayúscula
          const notas = alumno.calificaciones || alumno.Calificaciones || [];
          return notas.map((c) => Number.parseFloat(c.nota));
        });

        if (todasLasNotas.length > 0) {
          const suma = todasLasNotas.reduce((acc, nota) => acc + nota, 0);
          const promedioCalculated = (suma / todasLasNotas.length).toFixed(1);
          setPromedioCurso(promedioCalculated);
        } else {
          setPromedioCurso("0.0");
        }

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
      {/* --- CONTENIDO PRINCIPAL DERECHO --- */}
      <div className="dashboard-content">
        {seccion === "inicio" && (
          <div className="inicio-container">
            {/* Tarjeta de bienvenida */}
            <div className="welcome-card">
              <h1>Bienvenido, Profesor {nombreProfesor}</h1>
              <p>
                Aquí podrás gestionar tus cursos, registrar asistencias, subir
                calificaciones y mucho más.
              </p>
            </div>

            {/* Grid superior de estadísticas core */}
            <div className="stats-grid">
              <div className="stat-box azul">
                <h3>4</h3>
                <p>Cursos Asignados</p>
                <span className="stat-footer">8°A, 8°B, 8°C, 8°D</span>
              </div>
              <div className="stat-box verde">
                <h3>{loading ? "..." : estudiantes.length}</h3>
                <p>Total Alumnos</p>
                <span className="stat-footer">Matrícula oficial</span>
              </div>
              <div className="stat-box naranja">
                <h3>94.2%</h3>
                <p>Asistencia Promedio</p>
                <span className="stat-footer">Asistencia mensual</span>
              </div>
              {/* <div className="stat-box rojo">
                <h3>5</h3>
                <p>Promedio Curso</p>
                <span className="stat-footer">{promedioCurso}</span>
              </div> */}
            </div>

            {/* 🆕 NUEVO: Grid inferior de accesos rápidos oscuros de la maqueta */}
            <div
              className="accesos-directos-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "20px",
                marginTop: "30px",
              }}
            >
              <div
                className="acceso-card-oscuro"
                onClick={() => setSeccion("asistencia")}
                style={{
                  backgroundColor: "#1e2d4a",
                  color: "#ffffff",
                  padding: "40px 20px",
                  borderRadius: "4px",
                  textAlign: "center",
                  cursor: "pointer",
                  fontWeight: "bold",
                  fontSize: "1.1em",
                  transition: "transform 0.2s",
                }}
              >
                Registrar Asistencia
              </div>
              <div
                className="acceso-card-oscuro"
                onClick={() => setSeccion("calificaciones")}
                style={{
                  backgroundColor: "#1e2d4a",
                  color: "#ffffff",
                  padding: "40px 20px",
                  borderRadius: "4px",
                  textAlign: "center",
                  cursor: "pointer",
                  fontWeight: "bold",
                  fontSize: "1.1em",
                  transition: "transform 0.2s",
                }}
              >
                Registrar Calificaciones
              </div>
              <div
                className="acceso-card-oscuro"
                onClick={() => setSeccion("anotaciones")}
                style={{
                  backgroundColor: "#1e2d4a",
                  color: "#ffffff",
                  padding: "40px 20px",
                  borderRadius: "4px",
                  textAlign: "center",
                  cursor: "pointer",
                  fontWeight: "bold",
                  fontSize: "1.1em",
                  transition: "transform 0.2s",
                }}
              >
                Registrar Anotaciones
              </div>
            </div>
          </div>
        )}

        {seccion === "cursos" && (
          <Cursos
            alumnos={estudiantes}
            cargando={loading}
            setSeccion={setSeccion}
          />
        )}

        {seccion === "asistencia" && <Asistencia setSeccion={setSeccion} />}
        {seccion === "calificaciones" && (
          <Calificaciones setSeccion={setSeccion} />
        )}
        {seccion === "anotaciones" && <Anotaciones setSeccion={setSeccion} />}
      </div>
    </div>
  );
}

export default Dashboard;
