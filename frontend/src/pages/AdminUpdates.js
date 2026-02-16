import { useState } from "react";
import { auth } from "../firebase";

function AdminUpdates() {
  const [form, setForm] = useState({
    hospitalName: "",
    location: "",
    title: "",
    description: "",
  });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submitUpdate = async () => {
    setMessage("");
    const user = auth.currentUser;
    if (!user) {
      setMessage("You must be logged in as admin to post updates.");
      return;
    }

    if (
      !form.hospitalName ||
      !form.location ||
      !form.title ||
      !form.description
    ) {
      setMessage("Please fill all fields.");
      return;
    }

    const res = await fetch("http://localhost:5000/api/hospital-updates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: user.email,
        ...form,
      }),
    });

    if (res.ok) {
      setMessage("Hospital update posted successfully.");
      setForm({
        hospitalName: "",
        location: "",
        title: "",
        description: "",
      });
    } else {
      setMessage("You are not authorized to post updates.");
    }
  };

  return (
    <div style={{ padding: "30px" }}>
      <h1>Post Hospital Updates</h1>

      <div style={{ maxWidth: 500 }}>
        <div style={{ marginBottom: 10 }}>
          <label>Hospital Name</label>
          <input
            name="hospitalName"
            value={form.hospitalName}
            onChange={handleChange}
            style={{ width: "100%", padding: 8 }}
          />
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>Location</label>
          <input
            name="location"
            value={form.location}
            onChange={handleChange}
            style={{ width: "100%", padding: 8 }}
          />
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>Title</label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            style={{ width: "100%", padding: 8 }}
          />
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={4}
            style={{ width: "100%", padding: 8 }}
          />
        </div>

        <button onClick={submitUpdate}>Submit Update</button>

        {message && <p style={{ marginTop: 10 }}>{message}</p>}
      </div>
    </div>
  );
}

export default AdminUpdates;
