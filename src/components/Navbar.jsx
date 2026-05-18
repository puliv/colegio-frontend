import { Link, useLocation } from "react-router-dom";
import logo from "../assets/logo-colegio.png";
import "../styles/Navbar.css";

function Navbar() {
  const location = useLocation();
  const changeIcon = location.pathname === "/Dashboard";

  return (
    <nav className="navbar navbar-expand-lg">
      <div className="container-fluid">
        <Link to="/">
          <img src={logo} alt="" width="60" height="60" />
        </Link>
        {!changeIcon ? (
          <Link to="/login">
            <div className="door-icon">
              <p>Iniciar sesión</p>
              <i className="bi bi-door-closed-fill"></i>
            </div>
          </Link>
        ) : (
          <Link to="/">
            <div className="door-icon">
              <p>Cerrar sesión</p>
              <i className="bi bi-door-open"></i>
            </div>
          </Link>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
