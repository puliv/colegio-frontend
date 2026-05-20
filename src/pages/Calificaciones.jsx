import { useState } from "react";
import { getGradesByRut, createGrade } from "../services/api";

function Calificaciones() {
    const [rut, setRut] = useState("");
    const [notas, setNotas] = useState([]);
    const [asignatura, setAsignatura] = useState("");
    const [nota, setNota] = useState("");
    const [periodo, setPeriodo] = useState("");
    const [mensaje, setMensaje] = useState("");

    const buscarNotas = () => {
        getGradesByRut(rut)
            .then((res) => setNotas(res.data))
            .catch(() => setMensaje("Error al buscar notas."));
    };

    const registrarNota = () => {
        createGrade({ studentRut: rut, subject: asignatura, score: nota, period: periodo })
            .then(() => {
                setMensaje("Nota registrada correctamente.");
                buscarNotas();
            })
            .catch(() => setMensaje("Error al registrar nota."));
    };

    return (
        <div className="modulo-card">
            <h2>Calificaciones</h2>

            <div className="mb-3 d-flex gap-2">
                <input
                    type="text"
                    className="form-control"
                    placeholder="Buscar por RUT"
                    value={rut}
                    onChange={(e) => setRut(e.target.value)}
                />
                <button className="btn btn-primary" onClick={buscarNotas}>
                    Buscar
                </button>
            </div>

            <div className="mb-3 d-flex gap-2">
                <input
                    type="text"
                    className="form-control"
                    placeholder="Asignatura"
                    value={asignatura}
                    onChange={(e) => setAsignatura(e.target.value)}
                />
                <input
                    type="number"
                    className="form-control"
                    placeholder="Nota (1.0 - 7.0)"
                    min="1"
                    max="7"
                    step="0.1"
                    value={nota}
                    onChange={(e) => setNota(e.target.value)}
                />
                <input
                    type="text"
                    className="form-control"
                    placeholder="Período (ej: 1er semestre)"
                    value={periodo}
                    onChange={(e) => setPeriodo(e.target.value)}
                />
                <button className="btn btn-success" onClick={registrarNota}>
                    Registrar
                </button>
            </div>

            {mensaje && <div className="alert alert-info">{mensaje}</div>}

            {notas.length > 0 && (
                <table className="table table-bordered mt-3">
                    <thead>
                        <tr>
                            <th>Asignatura</th>
                            <th>Nota</th>
                            <th>Período</th>
                        </tr>
                    </thead>
                    <tbody>
                        {notas.map((n) => (
                            <tr key={n.id}>
                                <td>{n.subject}</td>
                                <td>{n.score}</td>
                                <td>{n.period}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default Calificaciones;