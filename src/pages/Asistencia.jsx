import { useState, useEffect } from "react";
import axios from "axios";
import "../styles/Asistencia.css";

function Asistencia() {
  const [cursos, setCursos] = useState([]);
  const [cursoSeleccionado, setCursoSeleccionado] = useState(null);
  const [alumnos, setAlumnos] = useState([]);
  const [asistencia, setAsistencia] = useState({}); // Guarda el estado del switch { alumnoId: true/false }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 1. Cargar los cursos del profesor al montar el componente
  useEffect(() => {
    const cargarCursos = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        
        const response = await axios.get("http://localhost:3000/api/v1/cursos", {
          headers: { Authorization: `Bearer ${token}` }
        });

                const listaCursos = response.data.cursos || response.data;
        setCursos(listaCursos);

        if (listaCursos.length > 0) {
          setCursoSeleccionado(listaCursos[0].id);
        }
      } catch (err) {
        console.error("Error al cargar cursos:", err);
        setError("No se pudieron cargar los cursos del profesor.");
      } finally {
        setLoading(false);
      }
    };

    cargarCursos();
  }, []);

  // 2. Cargar los alumnos cada vez que cambie el curso seleccionado
  useEffect(() => {
    if (!cursoSeleccionado) return;

    const cargarAlumnos = async () => {
      try {
        const token = localStorage.getItem("token");
        // Ajusta esta URL según tu endpoint para traer alumnos de un curso específico
        const response = await axios.get(`http://localhost:3000/api/v1/estudiantes?cursoId=${cursoSeleccionado}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const listaAlumnos = response.data.alumnos || response.data;
        
        // Ordenar alumnos alfabéticamente por apellido
        const ordenados = [...listaAlumnos].sort((a, b) =>
          a.apellido.localeCompare(b.apellido)
        );
        
        setAlumnos(ordenados);

        // Inicializar el estado de asistencia (todos presentes por defecto: true)
        const estadoInicial = {};
        ordenados.forEach((al) => {
          estadoInicial[al.id] = true;
        });
        setAsistencia(estadoInicial);

      } catch (err) {
        console.error("Error al cargar alumnos:", err);
        setAlumnos([]);
      }
    };

    cargarAlumnos();
  }, [cursoSeleccionado]);

  // Manejar el cambio del switch de asistencia
  const handleCheckChange = (alumnoId) => {
    setAsistencia((prev) => ({
      ...prev,
      [alumnoId]: !prev[alumnoId]
    }));
  };

  // 3. Enviar la asistencia al backend al presionar Guardar
  const guardarAsistencia = async () => {
    try {
      const token = localStorage.getItem("token");
      // Mapeamos el objeto de asistencia al formato que espere tu backend
      const registros = Object.keys(asistencia).map((id) => ({
        estudianteId: Number(id),
        presente: asistencia[id]
      }));

      await axios.post("http://localhost:3000/api/v1/asistencia", {
        cursoId: cursoSeleccionado,
        fecha: new Date().toISOString().split('T')[0], // YYYY-MM-DD
        registros
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert("¡Asistencia guardada con éxito!");
    } catch (err) {
      console.error("Error al guardar asistencia:", err);
      alert("Hubo un error al guardar el registro.");
    }
  };

  const cursoActivo = cursos.find((c) => c.id === cursoSeleccionado);

  if (loading) return <div className="text-center mt-5">Cargando módulos...</div>;

  return (
    <div className="asistencia-container">
      <h2>Registro de Asistencia</h2>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Selector de Cursos Dinámico */}
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

      {cursoActivo && alumnos.length > 0 ? (
        <div className="tabla-contenedor">
          <div className="tabla-header-info">
            <h3>Alumnos del {cursoActivo.nombre}</h3>
            <span className="badge-contador">
              Fecha: {new Date().toLocaleDateString("es-CL", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric"
              })}
            </span>
          </div>
          <table>
            <thead>
              <tr>
                <th style={{ width: "60px" }}>N°</th>
                <th>RUT</th>
                <th>Apellidos</th>
                <th>Nombres</th>
                <th className="check">Asistencia</th>
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
                        type="checkbox"
                        checked={asistencia[alumno.id] || false}
                        onChange={() => handleCheckChange(alumno.id)}
                      />
                      <span className="slider"></span>
                    </label>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button className="btn-tab btn-guardar" onClick={guardarAsistencia}>
            Guardar Asistencia
          </button>
        </div>
      ) : (
        <div className="alert alert-warning text-center mt-4">
          No se encontraron alumnos para el curso seleccionado.
        </div>
      )}
    </div>
  );
}

export default Asistencia;