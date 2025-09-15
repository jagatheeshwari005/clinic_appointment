import React from "react";
import PatientRecord from "../components/PatientRecord";

function EHR() {
  const records = [
    {
      name: "John Doe",
      age: 45,
      diagnosis: "Diabetes",
      prescription: "Metformin",
      date: "2025-09-01",
    },
    {
      name: "Alice Smith",
      age: 30,
      diagnosis: "Flu",
      prescription: "Paracetamol",
      date: "2025-09-10",
    },
    {
      name: "Michael Brown",
      age: 52,
      diagnosis: "Hypertension",
      prescription: "Amlodipine",
      date: "2025-08-22",
    },
  ];

  return (
    <div>
      <h2>Electronic Health Records</h2>
      {records.map((rec, index) => (
        <PatientRecord key={index} record={rec} />
      ))}
    </div>
  );
}

export default EHR;
