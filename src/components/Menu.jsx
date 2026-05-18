import { Link } from "react-router-dom";
import logo from "../assets/logo-colegio.png";
import "../styles/Menu.css";

function Menu({ mostrar, onCerrar }) {
  return mostrar ? (
    <div className="menu">
      <div className="colegio-icon" href=" ">
        <Link to="/" onClick={onCerrar}>
          <img src={logo} alt="" width="60" height="60" />
        </Link>
      </div>

      <button className="cerrar-icon" onClick={onCerrar}>
        <i className="bi bi-x-lg"></i>
      </button>

      <ul>
        <li>
          <Link to="/login">
            <button className="menu-btn" onClick={onCerrar}>Iniciar sesión</button>
          </Link>
        </li>
        <li>Calificaciones</li>
        <li>Asistencia</li>
        <li>Anotaciones</li>
        <li>Reportes</li>
      </ul>
    </div>
  ) : null;
}

export default Menu;
