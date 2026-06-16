import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/Login.css";

import logoColegio from "../assets/logo-colegio.png";

function Login() {
  const navigate = useNavigate();

  // Estados para controlar los inputs, errores y carga
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 🌐 Hacemos la petición real al backend
      const response = await axios.post(
        "http://localhost:3000/api/v1/auth/login",
        {
          email: email.toLowerCase().trim(),
          password: password,
        },
      );

      if (response.data.token) {
        localStorage.setItem("token", response.data.token);

        // Redirigimos al Dashboard
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Error en login:", error);
      if (error.response && error.response.data && error.response.data.msg) {
        setError(error.response.data.msg);
      } else {
        setError("Error al conectar con el servidor. Intente de nuevo.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* HEADER */}
      <div className="login-header">
        <Link to="/">
          <img src={logoColegio} alt="Logo Colegio" className="logo" />
        </Link>
        <h1>Colegio Bernardo O’Higgins</h1>
        <h3 className="login-slogan">
          Optimización administrativa para la gestión docente
        </h3>
      </div>

      {/* LOGIN */}
      <div className="login-card">
        <h2 className="login-title">Iniciar Sesión</h2>

        <form onSubmit={handleSubmit} className="login-form">
          {/* Mensaje de error dinámico */}
          {error && (
            <div
              className="alert alert-danger text-center py-2 mb-3"
              role="alert"
              style={{ fontSize: "14px" }}
            >
              {error}
            </div>
          )}

          <input
            type="email"
            className="form-control mb-3"
            placeholder="Correo"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            required
          />

          <input
            type="password"
            className="form-control mb-3"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            required
          />

          <button
            type="submit"
            className="btn login-button w-100"
            disabled={loading}
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
