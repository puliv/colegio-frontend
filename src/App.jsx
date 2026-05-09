import { Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import Menu from "./components/Menu";
import { useState } from "react";

function App() {
  const [mostrar, setMostrar] = useState(false);

  return (
    <>
      <Navbar onAbrirMenu={() => setMostrar(!mostrar)} />
      <Menu mostrar={mostrar} onCerrar={() => setMostrar(false)} />
      <Routes>
        <Route path="/" element={<Home />} />
        {/* <Route path="/dashboard" element={<Dashboard />} /> */}
      </Routes>
    </>
  );
}

export default App;
