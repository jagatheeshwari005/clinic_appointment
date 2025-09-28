import React from "react";

function PatientRecord({ records }) {
  return (
    <div className="record-container">
      <h2>Patient Records</h2>
      {records.length === 0 ? (
        <p>No records found.</p>
      ) : (
        <ul>
          {records.map((rec, i) => (
            <li key={i} className="record-card">
              <strong>Date:</strong> {rec.date} <br />
              <strong>Diagnosis:</strong> {rec.diagnosis} <br />
              <strong>Prescription:</strong> {rec.prescription}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default PatientRecord;
