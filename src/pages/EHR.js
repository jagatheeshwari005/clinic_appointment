import React, { useEffect, useMemo, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const API_APPOINTMENTS = "http://localhost:5000/appointments";

function EHR() {
  const [appointments, setAppointments] = useState([]);
  const [search, setSearch] = useState("");
  const [diseaseFilter, setDiseaseFilter] = useState("All");
  const [doctorFilter, setDoctorFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("All"); // All | Today | Upcoming | Past

  // Inline editing state
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    age: "",
    gender: "",
    disease: "",
    doctor: "",
    appointmentDate: "",
    notes: "",
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(API_APPOINTMENTS);
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
    return () => {
      cancelled = true;
    };
  }, []);

  // Persist to localStorage on any change
  useEffect(() => {
    localStorage.setItem("appointments", JSON.stringify(appointments));
  }, [appointments]);

  const uniqueDiseases = useMemo(() => {
    const set = new Set();
    appointments.forEach((a) => a.disease && set.add(a.disease));
    return ["All", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [appointments]);

  const uniqueDoctors = useMemo(() => {
    const set = new Set();
    appointments.forEach((a) => a.doctor && set.add(a.doctor));
    return ["All", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [appointments]);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  // Charts data
  const diseaseCounts = useMemo(() => {
    const m = {};
    (appointments || []).forEach((a) => {
      if (!a?.disease) return;
      m[a.disease] = (m[a.disease] || 0) + 1;
    });
    return m;
  }, [appointments]);

  const doctorCounts = useMemo(() => {
    const m = {};
    (appointments || []).forEach((a) => {
      if (!a?.doctor) return;
      m[a.doctor] = (m[a.doctor] || 0) + 1;
    });
    return m;
  }, [appointments]);

  const dateBuckets = useMemo(() => {
    const buckets = { Today: 0, Upcoming: 0, Past: 0 };
    (appointments || []).forEach((a) => {
      if (!a?.appointmentDate) return;
      const d = new Date(a.appointmentDate);
      d.setHours(0, 0, 0, 0);
      if (d.getTime() === today.getTime()) buckets.Today += 1;
      else if (d.getTime() > today.getTime()) buckets.Upcoming += 1;
      else buckets.Past += 1;
    });
    return buckets;
  }, [appointments, today]);

  const mkBar = (labels, values, label) => ({
    labels,
    datasets: [
      {
        label,
        data: values,
        backgroundColor: "rgba(0, 74, 173, 0.7)",
      },
    ],
  });

  const matchesFilters = (app) => {
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      (app.name && app.name.toLowerCase().includes(q)) ||
      (app.disease && app.disease.toLowerCase().includes(q)) ||
      (app.doctor && app.doctor.toLowerCase().includes(q));

    const matchesDisease = diseaseFilter === "All" || app.disease === diseaseFilter;
    const matchesDoctor = doctorFilter === "All" || app.doctor === doctorFilter;

    const appDate = app.appointmentDate ? new Date(app.appointmentDate) : null;
    if (appDate) appDate.setHours(0, 0, 0, 0);

    let matchesDate = true;
    if (dateFilter === "Today") {
      matchesDate = appDate && appDate.getTime() === today.getTime();
    } else if (dateFilter === "Upcoming") {
      matchesDate = appDate && appDate.getTime() >= today.getTime();
    } else if (dateFilter === "Past") {
      matchesDate = appDate && appDate.getTime() < today.getTime();
    }

    return matchesSearch && matchesDisease && matchesDoctor && matchesDate;
  };

  const filtered = useMemo(() => appointments.filter(matchesFilters), [appointments, search, diseaseFilter, doctorFilter, dateFilter]);

  const startEdit = (app) => {
    setEditingId(app._id || app.id || app.tempId || null);
    setEditForm({
      name: app.name || "",
      age: app.age || "",
      gender: app.gender || "",
      disease: app.disease || "",
      doctor: app.doctor || "",
      appointmentDate: app.appointmentDate ? new Date(app.appointmentDate).toISOString().split("T")[0] : "",
      notes: app.notes || "",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ name: "", age: "", gender: "", disease: "", doctor: "", appointmentDate: "", notes: "" });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((p) => ({ ...p, [name]: value }));
  };

  const saveEdit = async (app) => {
    const id = app._id || app.id || app.tempId;
    const payload = {
      name: editForm.name.trim(),
      age: Number(editForm.age),
      gender: editForm.gender,
      disease: editForm.disease,
      doctor: editForm.doctor,
      appointmentDate: new Date(editForm.appointmentDate).toISOString(),
      notes: editForm.notes.trim(),
    };

    try {
      if (app._id) {
        const res = await fetch(`${API_APPOINTMENTS}/${app._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const updated = await res.json();
        setAppointments((prev) => prev.map((a) => (a._id === app._id ? updated : a)));
      } else {
        // Local-only update
        setAppointments((prev) => prev.map((a) => (a === app || a.id === id ? { ...a, ...payload } : a)));
      }
      cancelEdit();
    } catch (e) {
      console.error("Update failed", e);
    }
  };

  const deleteAppointment = async (app) => {
    try {
      if (app._id) await fetch(`${API_APPOINTMENTS}/${app._id}`, { method: "DELETE" });
    } catch (e) {}
    setAppointments((prev) => prev.filter((a) => a !== app && a._id !== app._id));
  };

  const exportCSV = (rows) => {
    const header = ["name", "age", "gender", "disease", "doctor", "appointmentDate", "notes"];
    const escape = (val) => {
      if (val == null) return "";
      const s = String(val).replaceAll('"', '""');
      return `"${s}"`;
    };
    const csv = [
      header.join(","),
      ...rows.map((r) =>
        [r.name, r.age, r.gender, r.disease, r.doctor, r.appointmentDate ? new Date(r.appointmentDate).toISOString() : "", r.notes]
          .map(escape)
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `appointments_${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="ehr-page" style={{ maxWidth: 1200, margin: "0 auto", padding: "1rem" }}>
      <h2>Electronic Health Records</h2>

      {/* Controls */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", alignItems: "center", margin: "1rem 0" }}>
        <input
          type="text"
          placeholder="Search by patient, disease, doctor"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: "0.5rem", flex: "1 1 240px", minWidth: 220 }}
        />
        <select value={diseaseFilter} onChange={(e) => setDiseaseFilter(e.target.value)} style={{ padding: "0.5rem" }}>
          {uniqueDiseases.map((d) => (
            <option key={d}>{d}</option>
          ))}
        </select>
        <select value={doctorFilter} onChange={(e) => setDoctorFilter(e.target.value)} style={{ padding: "0.5rem" }}>
          {uniqueDoctors.map((d) => (
            <option key={d}>{d}</option>
          ))}
        </select>
        <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} style={{ padding: "0.5rem" }}>
          <option>All</option>
          <option>Today</option>
          <option>Upcoming</option>
          <option>Past</option>
        </select>
        <button onClick={() => exportCSV(filtered)} style={{ padding: "0.55rem 0.9rem", background: "#004aad", color: "#fff", border: 0, borderRadius: 6, cursor: "pointer" }}>
          Export CSV (Filtered)
        </button>
      </div>

      {/* Charts */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem", margin: "1rem 0" }}>
        <div style={{ background: "#fff", padding: "1rem", borderRadius: 8, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
          <h3 style={{ marginTop: 0, fontSize: 16 }}>Most Common Diseases</h3>
          <Bar data={mkBar(Object.keys(diseaseCounts), Object.values(diseaseCounts), "Appointments")}></Bar>
        </div>
        <div style={{ background: "#fff", padding: "1rem", borderRadius: 8, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
          <h3 style={{ marginTop: 0, fontSize: 16 }}>Appointments per Doctor</h3>
          <Bar data={mkBar(Object.keys(doctorCounts), Object.values(doctorCounts), "Appointments")}></Bar>
        </div>
        <div style={{ background: "#fff", padding: "1rem", borderRadius: 8, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
          <h3 style={{ marginTop: 0, fontSize: 16 }}>Appointment Timing</h3>
          <Bar
            data={mkBar(
              Object.keys(dateBuckets),
              Object.values(dateBuckets),
              "Count"
            )}
          ></Bar>
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: "auto", background: "#fff", borderRadius: 8, boxShadow: "0 2px 8px rgba(0,0,0,0.08)", margin: "1rem 0" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f1f3f5" }}>
              <th style={{ textAlign: "left", padding: "0.75rem" }}>Patient</th>
              <th style={{ textAlign: "left", padding: "0.75rem" }}>Age</th>
              <th style={{ textAlign: "left", padding: "0.75rem" }}>Gender</th>
              <th style={{ textAlign: "left", padding: "0.75rem" }}>Disease</th>
              <th style={{ textAlign: "left", padding: "0.75rem" }}>Doctor</th>
              <th style={{ textAlign: "left", padding: "0.75rem" }}>Date</th>
              <th style={{ textAlign: "left", padding: "0.75rem" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: "0.75rem", textAlign: "center", color: "#6c757d" }}>
                  No appointments found.
                </td>
              </tr>
            ) : (
              filtered.map((app, idx) => {
                const isEditing =
                  editingId && (app._id === editingId || app.id === editingId || app.tempId === editingId);
                return (
                  <tr key={app._id || app.id || app.tempId || idx} style={{ borderTop: "1px solid #e9ecef" }}>
                    <td style={{ padding: "0.65rem" }}>
                      {isEditing ? (
                        <input name="name" value={editForm.name} onChange={handleEditChange} />
                      ) : (
                        app.name
                      )}
                    </td>
                    <td style={{ padding: "0.65rem" }}>
                      {isEditing ? (
                        <input name="age" type="number" value={editForm.age} onChange={handleEditChange} />
                      ) : (
                        app.age
                      )}
                    </td>
                    <td style={{ padding: "0.65rem" }}>
                      {isEditing ? (
                        <select name="gender" value={editForm.gender} onChange={handleEditChange}>
                          <option value="">Select</option>
                          <option>Male</option>
                          <option>Female</option>
                          <option>Other</option>
                        </select>
                      ) : (
                        app.gender
                      )}
                    </td>
                    <td style={{ padding: "0.65rem" }}>
                      {isEditing ? (
                        <input name="disease" value={editForm.disease} onChange={handleEditChange} />
                      ) : (
                        app.disease
                      )}
                    </td>
                    <td style={{ padding: "0.65rem" }}>
                      {isEditing ? (
                        <input name="doctor" value={editForm.doctor} onChange={handleEditChange} />
                      ) : (
                        app.doctor
                      )}
                    </td>
                    <td style={{ padding: "0.65rem" }}>
                      {isEditing ? (
                        <input
                          name="appointmentDate"
                          type="date"
                          value={editForm.appointmentDate}
                          onChange={handleEditChange}
                        />
                      ) : (
                        app.appointmentDate ? new Date(app.appointmentDate).toLocaleDateString() : ""
                      )}
                    </td>
                    <td style={{ padding: "0.65rem", display: "flex", gap: "0.5rem" }}>
                      {isEditing ? (
                        <>
                          <button onClick={() => saveEdit(app)} style={{ padding: "0.4rem 0.7rem" }}>
                            Save
                          </button>
                          <button onClick={cancelEdit} style={{ padding: "0.4rem 0.7rem" }}>
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => startEdit(app)} style={{ padding: "0.4rem 0.7rem" }}>
                            Edit
                          </button>
                          <button
                            onClick={() => deleteAppointment(app)}
                            style={{ padding: "0.4rem 0.7rem", background: "#dc3545", color: "#fff", border: 0, borderRadius: 4 }}
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default EHR;
