import { useState } from "react";
import logo from "../assets/logo-colegio.png";
import "../styles/Navbar.css";

function Navbar({ onAbrirMenu }) {
  const [mostrar, setMostrar] = useState(false);

  const abrirMenu = () => {
    setMostrar(!mostrar);
  };

  return (
    <nav className="navbar navbar-expand-lg">
      <div className="container-fluid">
        <a className="navbar-brand" href="   ">
          <img src={logo} alt="" width="60" height="60" />
        </a>
        <button className="menu-icon" onClick={onAbrirMenu}>
          <i className="bi bi-list"></i>
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
