import { useState } from "react";
import { getAnnotationsByRut, createAnnotation } from "../services/api";

function Anotaciones() {
    const [rut, setRut] = useState("");
    const [anotaciones, setAnotaciones] = useState([]);
    const [descripcion, setDescripcion] = useState("");
    const [tipo, setTipo] = useState("positive");
    const [fecha, setFecha] = useState("");
    const [mensaje, setMensaje] = useState("");

    const buscarAnotaciones = () => {
        getAnnotationsByRut(rut)
            .then((res) => setAnotaciones(res.data))
            .catch(() => setMensaje("Error al buscar anotaciones."));
    };

    const registrarAnotacion = () => {
        createAnnotation({ studentRut: rut, description: descripcion, type: tipo, date: fecha })
            .then(() => {
                setMensaje("Anotación registrada correctamente.");
                buscarAnotaciones();
            })
            .catch(() => setMensaje("Error al registrar anotación."));
    };

    return (
        <div className="modulo-card">
            <h2>Anotaciones de Conducta</h2>

            <div className="mb-3 d-flex gap-2">
                <input
                    type="text"
                    className="form-control"
                    placeholder="Buscar por RUT"
                    value={rut}
                    onChange={(e) => setRut(e.target.value)}
                />
                <button className="btn btn-primary" onClick={buscarAnotaciones}>
                    Buscar
                </button>
            </div>

            <div className="mb-3 d-flex gap-2">
                <input
                    type="text"
                    className="form-control"
                    placeholder="Descripción"
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                />
                <select
                    className="form-select"
                    value={tipo}
                    onChange={(e) => setTipo(e.target.value)}
                >
                    <option value="positive">Positiva</option>
                    <option value="negative">Negativa</option>
                </select>
                <input
                    type="date"
                    className="form-control"
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                />
                <button className="btn btn-success" onClick={registrarAnotacion}>
                    Registrar
                </button>
            </div>

            {mensaje && <div className="alert alert-info">{mensaje}</div>}

            {anotaciones.length > 0 && (
                <table className="table table-bordered mt-3">
                    <thead>
                        <tr>
                            <th>Descripción</th>
                            <th>Tipo</th>
                            <th>Fecha</th>
                        </tr>
                    </thead>
                    <tbody>
                        {anotaciones.map((a) => (
                            <tr key={a.id}>
                                <td>{a.description}</td>
                                <td>{a.type === "positive" ? "✅ Positiva" : "❌ Negativa"}</td>
                                <td>{a.date}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default Anotaciones;