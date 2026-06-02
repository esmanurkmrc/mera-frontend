import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Kayit from "./pages/Kayit";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CanliKamera from "./pages/CanliKamera";
import MeraHaritasi from "./pages/MeraHaritasi";
import HayvanTakibi from "./pages/HayvanTakibi";
import SensorVerileri from "./pages/SensorVerileri";
// import Analizler from "./pages/Analizler";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/kayit" element={<Kayit />} />
        <Route path="/login" element={<Login />} />

        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/canli-kamera" element={<CanliKamera />} />
        <Route path="/mera-haritasi" element={<MeraHaritasi />} />
        <Route path="/hayvan-takibi" element={<HayvanTakibi />} />
        <Route path="/sensor-verileri" element={<SensorVerileri />} />

        {/* <Route path="/analizler" element={<Analizler />} /> */}

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;