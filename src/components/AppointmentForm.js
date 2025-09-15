import React, { useState } from "react";

function AppointmentForm() {
  const [form, setForm] = useState({
    name: "",
    age: "",
    date: "",
    doctor: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`✅ Appointment booked for ${form.name} with Dr. ${form.doctor} on ${form.date}`);
    setForm({ name: "", age: "", date: "", doctor: "" });
  };

  return (
    <form className="form" onSubmit={handleSubmit}>
      <h2>Book Appointment</h2>
      <input
        type="text"
        name="name"
        placeholder="Patient Name"
        value={form.name}
        onChange={handleChange}
        required
      />
      <input
        type="number"
        name="age"
        placeholder="Age"
        value={form.age}
        onChange={handleChange}
        required
      />
      <input
        type="date"
        name="date"
        value={form.date}
        onChange={handleChange}
        required
      />
      <select name="doctor" value={form.doctor} onChange={handleChange} required>
        <option value="">Select Doctor</option>
        <option value="Smith">Dr. Smith</option>
        <option value="Johnson">Dr. Johnson</option>
        <option value="Williams">Dr. Williams</option>
      </select>
      <button type="submit">Confirm Appointment</button>
    </form>
  );
}

export default AppointmentForm;
