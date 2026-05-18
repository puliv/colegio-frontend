import { Link } from "react-router-dom";
import logo from "../assets/logo-colegio.png";
import "../styles/Navbar.css";

function Navbar({ onAbrirMenu }) {
  return (
    <nav className="navbar navbar-expand-lg">
      <div className="container-fluid">
        <Link to="/">
          <img src={logo} alt="" width="60" height="60" />
        </Link>
        <button className="menu-icon" onClick={onAbrirMenu}>
          <i className="bi bi-list"></i>
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
