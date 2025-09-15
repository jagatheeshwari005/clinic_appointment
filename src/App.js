import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import Appointment from "./pages/Appointment";
import EHR from "./pages/EHR";
import Header from "./components/Header";
import Footer from "./components/Footer";
import "./App.css";

function App() {
  return (
    <Router>
      <Header />
      <nav className="nav">
        <Link to="/">Home</Link>
        <Link to="/appointment">Book Appointment</Link>
        <Link to="/ehr">EHR Records</Link>
      </nav>
      <div className="content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/appointment" element={<Appointment />} />
          <Route path="/ehr" element={<EHR />} />
        </Routes>
      </div>
      <Footer />
    </Router>
  );
}

export default App;
