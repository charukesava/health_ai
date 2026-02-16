import React, { useState } from "react";

function AppointmentLetter() {
  const [patientName, setPatientName] = useState("");
  const [date, setDate] = useState("");
  const [doctor, setDoctor] = useState("");
  const [reason, setReason] = useState("");
  const [letter, setLetter] = useState("");

  const generateLetter = () => {
    if (!patientName || !date || !doctor || !reason) {
      alert("Please fill all fields");
      return;
    }

    const content = `
APPOINTMENT LETTER

Patient Name: ${patientName}
Appointment Date: ${date}
Doctor / Hospital: ${doctor}
Reason for Visit: ${reason}

This letter confirms the above appointment.

Disclaimer: This appointment letter is generated for educational purposes only and does not confirm medical consultation or treatment.
`;
    setLetter(content);
  };

  const downloadText = () => {
    if (!letter) return;
    const blob = new Blob([letter], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "appointment-letter.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadPDF = () => {
    if (!letter) {
      generateLetter();
    }
    window.print();
  };

  return (
    <div style={{ padding: "16px" }}>
      <h2>Appointment Letter</h2>

      <div>
        <input
          type="text"
          placeholder="Patient Name"
          value={patientName}
          onChange={(e) => setPatientName(e.target.value)}
        />
      </div>

      <div>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      <div>
        <input
          type="text"
          placeholder="Doctor / Hospital"
          value={doctor}
          onChange={(e) => setDoctor(e.target.value)}
        />
      </div>

      <div>
        <textarea
          placeholder="Reason for visit"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
        />
      </div>

      <button onClick={generateLetter}>Generate Letter</button>
      <button onClick={downloadText} style={{ marginLeft: "8px" }}>
        Download as TXT
      </button>
      <button onClick={downloadPDF} style={{ marginLeft: "8px" }}>
        Print / Save as PDF
      </button>

      {letter && (
        <pre
          style={{
            whiteSpace: "pre-wrap",
            marginTop: "16px",
            padding: "12px",
            border: "1px solid #ddd",
          }}
        >
          {letter}
        </pre>
      )}
    </div>
  );
}

export default AppointmentLetter;
