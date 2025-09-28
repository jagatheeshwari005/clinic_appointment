import React from "react";
import clinicImage from "../assets/clinic.jpg";
import doctor1 from "../assets/doctor1.jpg";
import doctor2 from "../assets/doctor2.jpg";
import doctor3 from "../assets/doctor3.jpg";
import "./Home.css";

function Home() {
  const doctors = [
    {
      name: "Dr. Alice Smith",
      specialty: "Cardiologist",
      image: doctor1, // ✅ your actual image
      services: "Heart diseases, hypertension, ECG tests",
    },
    {
      name: "Dr. John Doe",
      specialty: "Dermatologist",
      image: doctor2,
      services: "Skin allergies, acne treatment, dermatology check-ups",
    },
    {
      name: "Dr. Emily Brown",
      specialty: "Pediatrician",
      image: doctor3,
      services: "Child health, vaccinations, general pediatric care",
    },
  ];

  return (
    <div className="home">
      {/* Hero Section */}
      <div
        className="hero"
        style={{
          backgroundImage: `url(${clinicImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          height: "70vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          className="hero-overlay"
          style={{
            background: "rgba(0,0,0,0.5)",
            color: "white",
            textAlign: "center",
            padding: "2rem",
            borderRadius: "10px",
          }}
        >
          <h1>Welcome to Our Clinic</h1>
          <p>Quality healthcare, easy appointments, and digital health records.</p>
        </div>
      </div>

      {/* About Section */}
      <section className="about">
        <h3>About Us</h3>
        <p>We provide quick appointments, digital health records, and modern patient care.</p>
      </section>

      {/* Doctors Section */}
      <section className="doctors-section">
        <h3>Our Doctors & Services</h3>
        <div className="doctors-row">
          {doctors.map((doc, idx) => (
            <div className="doctor-card" key={idx}>
              <img src={doc.image} alt={doc.name} />
              <div className="doctor-info">
                <h4>{doc.name}</h4>
                <p><strong>{doc.specialty}</strong></p>
                <p>{doc.services}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Home;
