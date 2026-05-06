import manoEscribiendo from "../assets/escribiendo.jpg";
import "../styles/Home.css";

function Home() {
  return (
    <section className="home">
      <div className="home-left">
        <h1>Optimización administrativa para la gestión docente</h1>
      </div>
      <div className="home-right">
        <img src={manoEscribiendo} alt=" " />
      </div>
    </section>
  );
}

export default Home;
