import React, { useEffect, useMemo, useState } from "react";
import "./AppointmentForm.css";
import doc1 from "../assets/doctor1.jpg";
import doc2 from "../assets/doctor2.jpg";
import doc3 from "../assets/doctor3.jpg";

const API_APPOINTMENTS = "http://localhost:5000/appointments";
const API_DOCTORS = "http://localhost:5000/doctors";

// Fallback diseases if backend returns no doctors or is unreachable
const DEFAULT_DISEASES = [
  "Hypertension",
  "Heart Disease",
  "Arrhythmia",
  "Acne",
  "Eczema",
  "Psoriasis",
  "Skin Allergy",
  "Fever",
  "Cold",
  "Flu",
  "Vaccination",
];

const DEFAULT_DOCTORS = [
  {
    name: "Dr. Alice Smith",
    specialty: "Cardiologist",
    image: doc1,
    diseases: ["Heart Disease", "Hypertension", "Arrhythmia"],
  },
  {
    name: "Dr. John Doe",
    specialty: "Dermatologist",
    image: doc2,
    diseases: ["Acne", "Eczema", "Psoriasis", "Skin Allergy"],
  },
  {
    name: "Dr. Emily Brown",
    specialty: "Pediatrician",
    image: doc3,
    diseases: ["Fever", "Cold", "Flu", "Vaccination"],
  },
];

function AppointmentForm({ onAdd }) {
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    disease: "",
    doctor: "",
    appointmentDate: "",
    notes: "",
  });

  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ type: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

  const [doctors, setDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);

  const today = new Date().toISOString().split("T")[0];

  // Fetch doctors to power disease dropdown and doctor selection
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(API_DOCTORS);
        const data = await res.json();
        if (cancelled) return;
        if (Array.isArray(data) && data.length > 0) {
          setDoctors(data);
        } else {
          setDoctors(DEFAULT_DOCTORS);
        }
      } catch (e) {
        console.error("Failed to load doctors", e);
        if (!cancelled) setDoctors(DEFAULT_DOCTORS);
      } finally {
        if (!cancelled) setLoadingDoctors(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const diseaseOptions = useMemo(() => {
    const set = new Set();
    doctors.forEach((d) => (d.diseases || []).forEach((dis) => set.add(dis)));
    const list = Array.from(set).sort((a, b) => a.localeCompare(b));
    return list.length ? list : DEFAULT_DISEASES;
  }, [doctors]);

  const availableDoctors = useMemo(() => {
    const selected = (formData.disease || "").toLowerCase().trim();
    if (!selected) return [];
    const matches = doctors.filter((d) =>
      (d.diseases || []).some((x) => {
        const norm = String(x || "").toLowerCase().trim();
        return norm === selected || norm.includes(selected);
      })
    );
    return matches;
  }, [doctors, formData.disease]);

  const validate = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = "Name is required";

    const ageNum = Number(formData.age);
    if (formData.age === "" || formData.age === null) newErrors.age = "Age is required";
    else if (Number.isNaN(ageNum)) newErrors.age = "Age must be a number";
    else if (ageNum < 0 || ageNum > 120) newErrors.age = "Age must be between 0 and 120";

    if (!formData.gender) newErrors.gender = "Select gender";

    if (!formData.disease) newErrors.disease = "Select disease";

    if (!formData.doctor) newErrors.doctor = "Select a doctor";

    if (!formData.appointmentDate) newErrors.appointmentDate = "Select date";
    else {
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      const sel = new Date(formData.appointmentDate);
      sel.setHours(0, 0, 0, 0);
      if (sel.getTime() < startOfToday.getTime()) newErrors.appointmentDate = "Date must be today or future";
    }

    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    setErrors((p) => ({ ...p, [name]: "" }));
    if (status.message) setStatus({ type: "", message: "" });
  };

  const handleDiseaseChange = (e) => {
    const value = e.target.value;
    setFormData((p) => ({ ...p, disease: value, doctor: "" })); // reset doctor when disease changes
    setErrors((p) => ({ ...p, disease: "", doctor: "" }));
  };

  const handleSelectDoctor = (docName) => {
    setFormData((p) => ({ ...p, doctor: docName }));
    setErrors((p) => ({ ...p, doctor: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: "", message: "" });

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setStatus({ type: "error", message: "Please correct the highlighted fields." });
      return;
    }

    setSubmitting(true);

    const payload = {
      name: formData.name.trim(),
      age: Number(formData.age),
      gender: formData.gender,
      disease: formData.disease,
      doctor: formData.doctor,
      appointmentDate: new Date(formData.appointmentDate).toISOString(),
      notes: formData.notes.trim(),
    };

    try {
      const res = await fetch(API_APPOINTMENTS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Request failed with status ${res.status}`);
      }
      const saved = await res.json();

      if (typeof onAdd === "function") onAdd(saved);

      const current = JSON.parse(localStorage.getItem("appointments") || "[]");
      current.push(saved);
      localStorage.setItem("appointments", JSON.stringify(current));

      setStatus({ type: "success", message: "Appointment saved successfully." });

      setFormData({ name: "", age: "", gender: "", disease: "", doctor: "", appointmentDate: "", notes: "" });
      setErrors({});
    } catch (err) {
      console.error("Error saving to backend", err);
      const localRecord = { ...payload, tempId: Date.now() };
      if (typeof onAdd === "function") onAdd(localRecord);
      const current = JSON.parse(localStorage.getItem("appointments") || "[]");
      current.push(localRecord);
      localStorage.setItem("appointments", JSON.stringify(current));
      setStatus({ type: "error", message: "Backend not reachable. Saved locally." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="appointment-form" onSubmit={handleSubmit} noValidate>
      {status.message ? (
        <div
          role="status"
          aria-live="polite"
          style={{
            gridColumn: "1 / -1",
            padding: "0.75rem 1rem",
            borderRadius: 8,
            background: status.type === "success" ? "#d1e7dd" : "#f8d7da",
            color: status.type === "success" ? "#0f5132" : "#842029",
            border: `1px solid ${status.type === "success" ? "#badbcc" : "#f5c2c7"}`,
          }}
        >
          {status.message}
        </div>
      ) : null}

      <label>
        Name
        <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Full name" required />
        {errors.name && <span className="error">{errors.name}</span>}
      </label>

      <label>
        Age
        <input type="number" name="age" value={formData.age} onChange={handleChange} min={0} max={120} placeholder="0 - 120" required />
        {errors.age && <span className="error">{errors.age}</span>}
      </label>

      <label>
        Gender
        <select name="gender" value={formData.gender} onChange={handleChange} required>
          <option value="">Select</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
        {errors.gender && <span className="error">{errors.gender}</span>}
      </label>

      <label>
        Disease
        <select name="disease" value={formData.disease} onChange={handleDiseaseChange} required>
          <option value="">{loadingDoctors ? "Loading diseases..." : "Select disease"}</option>
          {diseaseOptions.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
        {errors.disease && <span className="error">{errors.disease}</span>}
      </label>

      <label>
        Appointment Date
        <input type="date" name="appointmentDate" min={today} value={formData.appointmentDate} onChange={handleChange} required />
        {errors.appointmentDate && <span className="error">{errors.appointmentDate}</span>}
      </label>

      {/* Doctor selection grid */}
      <div style={{ gridColumn: "1 / -1" }}>
        <div style={{ fontWeight: 700, marginBottom: 8 }}>Available Doctors</div>
        {!formData.disease ? (
          <div style={{ color: "#6c757d" }}>Select a disease to view available doctors.</div>
        ) : availableDoctors.length === 0 ? (
          <>
            <div style={{ color: "#664d03", background: "#fff3cd", padding: "0.5rem 0.75rem", borderRadius: 6, border: "1px solid #ffecb5", marginBottom: 8 }}>
              No exact match found for the selected disease. Showing all doctors.
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "0.75rem" }}>
              {doctors.map((doc) => {
              const selected = formData.doctor === doc.name;
              return (
                <button
                  type="button"
                  key={doc._id || doc.name}
                  onClick={() => handleSelectDoctor(doc.name)}
                  aria-pressed={selected}
                  style={{
                    display: "flex",
                    gap: 12,
                    alignItems: "center",
                    textAlign: "left",
                    background: "#fff",
                    border: selected ? "2px solid #004aad" : "1px solid #dee2e6",
                    boxShadow: selected ? "0 0 0 4px rgba(0,74,173,0.1)" : "0 2px 6px rgba(0,0,0,0.06)",
                    borderRadius: 10,
                    padding: 10,
                    cursor: "pointer",
                  }}
                >
                  <img
                    src={doc.image || "https://via.placeholder.com/64"}
                    alt={doc.name}
                    style={{ width: 64, height: 64, objectFit: "cover", borderRadius: 8 }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700 }}>{doc.name}</div>
                    <div style={{ fontSize: 12, color: "#6c757d" }}>{doc.specialty}</div>
                  </div>
                </button>
              );
            })}
          </div>
          </>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "0.75rem" }}>
            {availableDoctors.map((doc) => {
              const selected = formData.doctor === doc.name;
              return (
                <button
                  type="button"
                  key={doc._id || doc.name}
                  onClick={() => handleSelectDoctor(doc.name)}
                  aria-pressed={selected}
                  style={{
                    display: "flex",
                    gap: 12,
                    alignItems: "center",
                    textAlign: "left",
                    background: "#fff",
                    border: selected ? "2px solid #004aad" : "1px solid #dee2e6",
                    boxShadow: selected ? "0 0 0 4px rgba(0,74,173,0.1)" : "0 2px 6px rgba(0,0,0,0.06)",
                    borderRadius: 10,
                    padding: 10,
                    cursor: "pointer",
                  }}
                >
                  <img
                    src={doc.image || "https://via.placeholder.com/64"}
                    alt={doc.name}
                    style={{ width: 64, height: 64, objectFit: "cover", borderRadius: 8 }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700 }}>{doc.name}</div>
                    <div style={{ fontSize: 12, color: "#6c757d" }}>{doc.specialty}</div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
        {errors.doctor && <span className="error">{errors.doctor}</span>}
      </div>

      <label style={{ gridColumn: "1 / -1" }}>
        Notes (optional)
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows={3}
          placeholder="Additional details for the doctor"
          style={{ padding: "0.5rem", border: "1px solid #ccc", borderRadius: 6, fontFamily: "inherit" }}
        />
      </label>

      <button type="submit" disabled={submitting} aria-busy={submitting}>
        {submitting ? "Booking..." : "Book Appointment"}
      </button>
    </form>
  );
}

export default AppointmentForm;
