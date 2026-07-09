import { useState, useEffect } from "react";
import axios from "axios";
import PropTypes from "prop-types";
import "../styles/Asistencia.css";

function Asistencia({ setSeccion }) {
  const [cursos, setCursos] = useState([]);
  const [cursoSeleccionado, setCursoSeleccionado] = useState(null);
  const [alumnos, setAlumnos] = useState([]);
  const [asistencia, setAsistencia] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const url = import.meta.env.VITE_API_URL;

  // 1. Cargar los cursos del profesor al montar el componente
  useEffect(() => {
    const cargarCursos = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        const response = await axios.get(
          import.meta.env.VITE_API_URL +"/api/v1/cursos",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

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
        const response = await axios.get(
          import.meta.env
            .VITE_API_URL + `/api/v1/estudiantes?cursoId=${cursoSeleccionado}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const listaAlumnos = response.data.alumnos || response.data;

        const ordenados = [...listaAlumnos].sort((a, b) =>
          a.apellido.localeCompare(b.apellido)
        );

        setAlumnos(ordenados);

        // 🔄 MODIFICADO: Inicializa la justificación como un string vacío ""
        const estadoInicial = {};
        ordenados.forEach((al) => {
          estadoInicial[al.id] = { presente: false, justificacion: "" };
        });
        setAsistencia(estadoInicial);
      } catch (err) {
        console.error("Error al cargar alumnos:", err);
        setAlumnos([]);
      }
    };

    cargarAlumnos();
  }, [cursoSeleccionado]);

  // Manejar el cambio del switch "Presente"
  const handlePresenteChange = (alumnoId) => {
    setAsistencia((prev) => {
      const nuevoEstadoPresente = !prev[alumnoId]?.presente;
      return {
        ...prev,
        [alumnoId]: {
          presente: nuevoEstadoPresente,
          // 🔄 Si pasa a estar Presente, limpiamos el texto de la justificación automáticamente
          justificacion: nuevoEstadoPresente
            ? ""
            : prev[alumnoId]?.justificacion,
        },
      };
    });
  };

  // 🔄 NUEVO: Manejar la escritura en el input de Justificación
  const handleJustificacionTextChange = (alumnoId, texto) => {
    setAsistencia((prev) => ({
      ...prev,
      [alumnoId]: {
        ...prev[alumnoId],
        justificacion: texto,
      },
    }));
  };

  // 3. Enviar la asistencia al backend al presionar Guardar
  const guardarAsistencia = async () => {
    try {
      const token = localStorage.getItem("token");

      const registros = Object.keys(asistencia).map((id) => ({
        estudianteId: Number(id),
        presente: asistencia[id].presente,
        justificacion: asistencia[id].justificacion.trim(), // 👈 Enviamos el texto limpio de espacios
      }));

      await axios.post(
        url + "/api/v1/asistencia",
        {
          cursoId: cursoSeleccionado,
          fecha: new Date().toISOString().split("T")[0],
          registros,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert("¡Asistencia guardada con éxito!");
    } catch (err) {
      console.error("Error al guardar asistencia:", err);
      alert("Hubo un error al guardar el registro.");
    }
  };

  const cursoActivo = cursos.find((c) => c.id === cursoSeleccionado);

  if (loading)
    return <div className="text-center mt-5">Cargando módulos...</div>;

  return (
    <div className="asistencia-container">
      {/* Cabecera */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h2 style={{ margin: 0 }}>Registro de Asistencia</h2>
        <button
          onClick={() => setSeccion("inicio")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            backgroundColor: "#1e2d4a",
            color: "#ffffff",
            border: "none",
            padding: "10px 18px",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "0.95em",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            transition: "background-color 0.2s",
          }}
          onMouseOver={(e) =>
            (e.currentTarget.style.backgroundColor = "#2c3e66")
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.backgroundColor = "#1e2d4a")
          }
        >
          <i className="bi bi-arrow-left"></i> Volver al Inicio
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Selector de Cursos */}
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
              Fecha:{" "}
              {new Date().toLocaleDateString("es-CL", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
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
                <th className="check">Presente</th>
                <th>Justificación</th> {/* 🔄 ENCABEZADO ACTUALIZADO */}
              </tr>
            </thead>
            <tbody>
              {alumnos.map((alumno, index) => {
                const esPresente = asistencia[alumno.id]?.presente || false;
                const textoJustificacion =
                  asistencia[alumno.id]?.justificacion || "";

                return (
                  <tr key={alumno.id}>
                    <td>
                      <strong>{index + 1}</strong>
                    </td>
                    <td className="text-run">{alumno.rut}</td>
                    <td>{alumno.apellido}</td>
                    <td>{alumno.nombre}</td>

                    {/* Switch Presente */}
                    <td className="check">
                      <label className="switch">
                        <input
                          type="checkbox"
                          checked={esPresente}
                          onChange={() => handlePresenteChange(alumno.id)}
                        />
                        <span className="slider"></span>
                      </label>
                    </td>

                    {/*  Input de texto para la justificación */}
                    <td>
                      <input
                        type="text"
                        placeholder={
                          esPresente ? "" : "Ej: Licencia médica, citación..."
                        }
                        disabled={esPresente}
                        value={textoJustificacion}
                        onChange={(e) =>
                          handleJustificacionTextChange(
                            alumno.id,
                            e.target.value
                          )
                        }
                        className="input-evaluacion" // Reutiliza tus clases CSS de inputs limpios
                        style={{
                          width: "100%",
                          padding: "6px 10px",
                          height: "34px",
                          borderRadius: "4px",
                          border: "1px solid #ccc",
                          backgroundColor: esPresente ? "#f5f5f5" : "#ffffff",
                          opacity: esPresente ? 0.6 : 1,
                          transition: "all 0.2s",
                        }}
                      />
                    </td>
                  </tr>
                );
              })}
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

Asistencia.propTypes = {
  setSeccion: PropTypes.func.isRequired,
};
