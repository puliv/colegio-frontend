import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo-colegio.png";
import "../styles/Navbar.css";

function Navbar() {
  const navigate = useNavigate();

  // 1. Verificamos si el usuario está logueado comprobando si existe el token
  const token = localStorage.getItem("token") || localStorage.getItem("Token");
  const isAuthenticated = !!token; // Devuelve true si existe, false si no

  // 2. Función para cerrar sesión de manera real
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("Token");
    navigate("/"); // Redirige a la página de inicio o login
  };

  return (
    <nav className="navbar navbar-expand-lg">
      <div className="container-fluid">
        {/* Si está autenticado el logo lleva al Dashboard, si no, al inicio de la web */}
        <Link to={isAuthenticated ? "/Dashboard" : "/"}>
          <div className="nav-left">
            <img src={logo} alt="Logo Colegio" width="60" height="60" />
            <h5>Colegio Bernardo O'Higgins</h5>
          </div>
        </Link>

        {/* 3. Renderizado condicional basado en la autenticación real */}
        {isAuthenticated ? (
          <div
            className="door-icon"
            onClick={handleLogout}
            style={{ cursor: "pointer" }}
          >
            <p>Cerrar sesión</p>
            <i className="bi bi-door-open"></i>
          </div>
        ) : (
          <Link to="/login">
            <div className="door-icon">
              <p>Iniciar sesión</p>
              <i className="bi bi-door-closed-fill"></i>
            </div>
          </Link>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
