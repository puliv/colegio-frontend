import logo from "../assets/logo-colegio.png";
import "../styles/Navbar.css";

function Navbar() {
  return (
    <nav className="navbar navbar-expand-lg">
      <div className="container-fluid">
        <a className="navbar-brand" href="   ">
          <img src={logo} alt="" width="60" height="60" />
        </a>
        <div className="menu-icon">
          <i className="bi bi-list"></i>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
