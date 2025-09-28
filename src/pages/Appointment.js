import React, { useState, useEffect } from "react";
import AppointmentForm from "../components/AppointmentForm";
import "../components/AppointmentForm.css";

function Appointment() {
  const [appointments, setAppointments] = useState([]);

  // Load from backend first; fallback to localStorage
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/appointments");
        const data = await res.json();
        if (!cancelled && Array.isArray(data)) {
          setAppointments(data);
          localStorage.setItem("appointments", JSON.stringify(data));
          return;
        }
      } catch (e) {}
      if (!cancelled) {
        const saved = JSON.parse(localStorage.getItem("appointments")) || [];
        setAppointments(saved);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Persist to localStorage on any change
  useEffect(() => {
    localStorage.setItem("appointments", JSON.stringify(appointments));
  }, [appointments]);

  const addAppointment = (data) => {
    setAppointments([...appointments, data]);
  };

  return (
    <div className="appointment-page">
      <h2>Book an Appointment</h2>
      <AppointmentForm onAdd={addAppointment} />

      <div className="stats">
        <p>Total Patients: {appointments.length}</p>
        <p>Upcoming Appointments: {appointments.filter(a => new Date(a.appointmentDate) >= new Date()).length}</p>
      </div>

      {/* Graph removed as requested */}
    </div>
  );
}

export default Appointment;
