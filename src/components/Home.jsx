import { Link } from "react-router-dom";
import manoEscribiendo from "../assets/escribiendo.jpeg";
import niñoLevantando from "../assets/niño-lvantando-mano.jpeg";
import "../styles/Home.css";

function Home() {
  return (
    <section className="home">
      <div className="home-top">
        <div className="home-left">
          <h1>Optimización administrativa para la gestión docente</h1>
        </div>

        <div className="home-right">
          <img src={manoEscribiendo} alt=" " />
        </div>
      </div>

      <div className="home-bottom">
        <div className="home-bottom-overlay">
          <img src={niñoLevantando} alt="" />
          <h1 className="home-bottom-text">
            Registra asistencia, calificaciones y observaciones <br /> a tus
            alumnos desde un solo lugar
          </h1>
          <Link to="/login">
            <button className="home-btn-text start">Comenzar</button>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default Home;
