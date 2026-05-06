import { Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./components/Home";

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        {/* <Route path="/dashboard" element={<Dashboard />} /> */}
      </Routes>
    </>
  );
}

export default App;
