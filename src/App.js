import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Appointment from "./pages/Appointment";
import EHR from "./pages/EHR";
import "./App.css";

function App() {
  return (
    <Router>
      <Header />

      <main className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/appointments" element={<Appointment />} />
          <Route path="/ehr" element={<EHR />} />
        </Routes>
      </main>

      <Footer />
    </Router>
  );
}

export default App;
