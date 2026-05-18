import { Routes, Route, useLocation } from "react-router-dom";
import Login from "./pages/Login";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import Menu from "./components/Menu";
import { useState } from "react";
import Footer from "./components/Footer";
import "./styles/App.css";

function App() {
  const [mostrar, setMostrar] = useState(false);
  const location = useLocation();
  const hideNavbar = location.pathname === "/login";

  return (
    <>
      {!hideNavbar && (
        <>
          <Navbar onAbrirMenu={() => setMostrar(!mostrar)} />
          <Menu mostrar={mostrar} onCerrar={() => setMostrar(false)} />
        </>
      )}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
      </Routes>
      {!hideNavbar && <Footer />}
    </>
  );
}

export default App;
