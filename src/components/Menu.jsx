import "../styles/Menu.css";

function Menu({ mostrar, onCerrar }) {
  return mostrar ? (
    <div className="menu">
      <button className="cerrar-icon" onClick={onCerrar}>
        <i className="bi bi-x-lg"></i>
      </button>
      <ul>
        <li>Inicio</li>
        <li>Calificaciones</li>
        <li>Asistencia</li>
        <li>Anotaciones</li>
        <li>Reportes</li>
      </ul>
    </div>
  ) : null;
}

export default Menu;
