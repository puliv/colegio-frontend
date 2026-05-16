import { useState } from "react";
import { useNavigate } from "react-router-dom";

import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/Login.css';

import logoColegio from "../assets/logo-colegio.png";

function Login() {
    const navigate = useNavigate();

    // Estados para controlar los inputs y errores
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Credenciales oficiales asignadas
        const correoValido = "benjamin.profesor@cbohiggins.cl";
        const contrasenaValida = "benja2026";

        // Validación limpiando espacios y asegurando minúsculas en el email
        if (email.toLowerCase().trim() === correoValido && password === contrasenaValida) {
            setError("");
            navigate("/dashboard");
        } else {
            setError("Credenciales incorrectas. Por favor, intente de nuevo.");
        }
    };

    return (
        <div className="login-container">

            {/* HEADER */}
            <div className="login-header">
                <img
                    src={logoColegio}
                    alt="Logo Colegio"
                    className="logo"
                />
                <h1>Colegio Bernardo O’Higgins</h1>
                <h3 className="login-slogan">
                    Optimización administrativa para la gestión docente
                </h3>
            </div>

            {/* LOGIN */}
            <div className="login-card">
                <h2 className="login-title">
                    Iniciar Sesión
                </h2>

                <form onSubmit={handleSubmit} className="login-form">
                    
                    {/* Mensaje de error dinámico */}
                    {error && (
                        <div className="alert alert-danger text-center py-2 mb-3" role="alert" style={{ fontSize: '14px' }}>
                            {error}
                        </div>
                    )}

                    <input
                        type="email"
                        className="form-control mb-3"
                        placeholder="Correo"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <input
                        type="password"
                        className="form-control mb-3"
                        placeholder="Contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    <button type="submit" className="btn login-button w-100">
                        Ingresar
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Login;