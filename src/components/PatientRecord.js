import React from "react";

function PatientRecord({ record }) {
  return (
    <div className="record">
      <h3>{record.name} ({record.age} yrs)</h3>
      <p><b>Diagnosis:</b> {record.diagnosis}</p>
      <p><b>Prescription:</b> {record.prescription}</p>
      <p><b>Last Visit:</b> {record.date}</p>
    </div>
  );
}

export default PatientRecord;
