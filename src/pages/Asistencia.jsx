import { useState } from "react";
import { getAttendanceByRut, createAttendance } from "../services/api";

function Asistencia() {
    const [rut, setRut] = useState("");
    const [asistencias, setAsistencias] = useState([]);
    const [fecha, setFecha] = useState("");
    const [presente, setPresente] = useState(true);
    const [mensaje, setMensaje] = useState("");

    const buscarAsistencia = () => {
        getAttendanceByRut(rut)
            .then((res) => setAsistencias(res.data))
            .catch(() => setMensaje("Error al buscar asistencia."));
    };

    const registrarAsistencia = () => {
        createAttendance({ studentRut: rut, date: fecha, present: presente })
            .then(() => {
                setMensaje("Asistencia registrada correctamente.");
                buscarAsistencia();
            })
            .catch(() => setMensaje("Error al registrar asistencia."));
    };

    return (
        <div className="modulo-card">
            <h2>Registrar Asistencia</h2>

            <div className="mb-3 d-flex gap-2">
                <input
                    type="text"
                    className="form-control"
                    placeholder="Buscar por RUT"
                    value={rut}
                    onChange={(e) => setRut(e.target.value)}
                />
                <button className="btn btn-primary" onClick={buscarAsistencia}>
                    Buscar
                </button>
            </div>

            <div className="mb-3 d-flex gap-2 align-items-center">
                <input
                    type="date"
                    className="form-control"
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                />
                <select
                    className="form-select"
                    value={presente}
                    onChange={(e) => setPresente(e.target.value === "true")}
                >
                    <option value="true">Presente</option>
                    <option value="false">Ausente</option>
                </select>
                <button className="btn btn-success" onClick={registrarAsistencia}>
                    Registrar
                </button>
            </div>

            {mensaje && <div className="alert alert-info">{mensaje}</div>}

            {asistencias.length > 0 && (
                <table className="table table-bordered mt-3">
                    <thead>
                        <tr>
                            <th>Fecha</th>
                            <th>Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        {asistencias.map((a) => (
                            <tr key={a.id}>
                                <td>{a.date}</td>
                                <td>{a.present ? "✅ Presente" : "❌ Ausente"}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default Asistencia;