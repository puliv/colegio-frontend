import { useNavigate } from "react-router-dom";

import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/Login.css';

import logoColegio from "../assets/logo-colegio.png";

function Login() {

    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        navigate("/dashboard");
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

                    <input
                        type="email"
                        className="form-control mb-3"
                        placeholder="Correo"
                    />

                    <input
                        type="password"
                        className="form-control mb-3"
                        placeholder="Contraseña"
                    />

                    <button className="btn login-button">
                        Ingresar
                    </button>

                </form>

            </div>

        </div>
    );
}

export default Login;