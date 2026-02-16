import { postData } from "../services/api";

export default function EmergencyAlert() {
  const send = async () => {
    try {
      await postData("/emergency", { msg: "Help needed" });
      alert("Emergency alert sent (mock)");
    } catch (e) {
      console.error(e);
      alert("Failed to send emergency alert");
    }
  };

  return (
    <button onClick={send} style={{ padding: "8px 16px" }}>
      🚨 Emergency Alert
    </button>
  );
}
