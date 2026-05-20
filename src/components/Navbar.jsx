import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/logo-colegio.png";
import "../styles/Navbar.css";

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const changeIcon = location.pathname.toLowerCase() === "/dashboard";

  console.log("pathname:", location.pathname, "changeIcon:", changeIcon);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("fullName");
    localStorage.removeItem("role");
    navigate("/");
  };

  return (
    <nav className="navbar navbar-expand-lg">
      <div className="container-fluid">
        <Link to="/">
          <div className="nav-left">
            <img src={logo} alt="" width="60" height="60" />
            <h5>Colegio Bernado O'Higgins</h5>
          </div>
        </Link>
        {!changeIcon ? (
          <Link to="/login">
            <div className="door-icon">
              <p>Iniciar sesión</p>
              <i className="bi bi-door-closed-fill"></i>
            </div>
          </Link>
        ) : (
          <div className="door-icon" onClick={handleLogout} style={{ cursor: "pointer" }}>
            <p>Cerrar sesión</p>
            <i className="bi bi-door-open"></i>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;