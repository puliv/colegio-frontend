import "../styles/Footer.css";
import logo from "../assets/logo-colegio.png";

function Footer() {
  return (
    <footer>
      <div className="footer-left">
        <p>
          El Colegio Bernardo O'Higgins es una comunidad educativa laica
          comprometida con la formación integral de niños, niñas y jóvenes.
          Fundada sobre los valores de la libertad, el pensamiento crítico y el
          respeto por la diversidad, nuestra institución cree en una educación
          que pone a la persona en el centro, sin distinción de creencias ni
          origen.
        </p>
      </div>
      <div className="footer-right">
        <img src={logo} alt="" width="80" height="80" />
        <p>&copy; 2026 Colegio Bernardo O'Higgins</p>
      </div>
    </footer>
  );
}

export default Footer;
