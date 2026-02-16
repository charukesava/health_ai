import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function Feedback() {
  const { isAdmin } = useContext(AuthContext);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(false);

  // LOAD FEEDBACK
  const loadFeedback = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/feedback");
      const data = await res.json();
      setFeedbackList(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load feedback", err);
    }
  };

  // SUBMIT FEEDBACK
  const submitFeedback = async () => {
    if (rating === 0) return;
    setLoading(true);
    try {
      await fetch("http://localhost:5000/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating,
          comment,
        }),
      });
      setRating(0);
      setComment("");
      loadFeedback();
    } catch (err) {
      console.error("Failed to submit feedback", err);
    } finally {
      setLoading(false);
    }
  };

  // DELETE FEEDBACK (ADMIN ONLY) – requires backend DELETE endpoint to exist
  const deleteFeedback = async (index) => {
    if (!isAdmin) return;
    if (!window.confirm("Delete this feedback?")) return;

    // Simple client-side delete if backend doesn't support DELETE
    const updated = feedbackList.filter((_, i) => i !== index);
    setFeedbackList(updated);
  };

  useEffect(() => {
    loadFeedback();
  }, []);

  const averageRating =
    feedbackList.length === 0
      ? 0
      : feedbackList.reduce((sum, f) => sum + Number(f.rating || 0), 0) /
        feedbackList.length;

  return (
    <div style={{ padding: "16px" }}>
      <h2>Feedback</h2>

      <p>Average rating: {averageRating.toFixed(1)} / 5</p>

      <div style={{ marginBottom: "16px" }}>
        <label>
          Rating:
          <select
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
          >
            <option value={0}>Select</option>
            {[1, 2, 3, 4, 5].map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </label>

        <br />

        <textarea
          placeholder="Your comments..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          style={{ width: "100%", marginTop: "8px" }}
        />

        <button
          onClick={submitFeedback}
          disabled={rating === 0 || loading}
          style={{ marginTop: "8px" }}
        >
          {loading ? "Submitting..." : "Submit"}
        </button>
      </div>

      <h3>All Feedback</h3>
      {feedbackList.length === 0 && <p>No feedback yet.</p>}

      <ul>
        {feedbackList.map((f, index) => (
          <li key={index} style={{ marginBottom: "8px" }}>
            <strong>Rating:</strong> {f.rating} – {f.comment || "No comment"}
            {isAdmin && (
              <button
                style={{ marginLeft: "8px" }}
                onClick={() => deleteFeedback(index)}
              >
                Delete
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
