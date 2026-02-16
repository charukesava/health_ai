import { useState, useRef, useEffect } from "react";
import Header from "../components/Header";

const BOT_IMG = "https://cdn-icons-png.flaticon.com/512/4712/4712109.png";

function HealthChat() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      from: "bot",
      text: "Hello! I am your Health Assistant. I provide general health guidance (not medical diagnosis). How can I help you?",
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const getTime = () =>
    new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

  const sendMessage = async () => {
    if (!message.trim()) return;
    const userText = message;

    setMessages((prev) => [
      ...prev,
      { from: "user", text: userText, time: getTime() },
    ]);
    setMessage("");
    setIsTyping(true);

    try {
      const res = await fetch("http://localhost:5000/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symptoms: userText }),
      });
      const data = await res.json();

      const replyText = `
Possible condition: ${data.possibleCondition}
Advice: ${data.advice}
Consult doctor: ${data.consultDoctor}
${data.disclaimer}
      `.trim();

      setMessages((prev) => [
        ...prev,
        { from: "bot", text: replyText, time: getTime() },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          from: "bot",
          text: "Unable to provide guidance right now. Please try again.",
          time: getTime(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      <Header />
      <div
        style={{
          padding: "20px",
          maxWidth: "800px",
          margin: "0 auto",
        }}
      >
        <h1>Health Chat</h1>

        <div
          style={{
            border: "1px solid #ddd",
            borderRadius: "8px",
            padding: "16px",
            height: "400px",
            overflowY: "auto",
            marginTop: "16px",
          }}
        >
          {messages.map((m, idx) => (
            <div
              key={idx}
              style={{
                marginBottom: "12px",
                textAlign: m.from === "user" ? "right" : "left",
              }}
            >
              {m.from === "bot" && (
                <img
                  src={BOT_IMG}
                  alt="bot"
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    marginRight: 8,
                    verticalAlign: "middle",
                  }}
                />
              )}
              <span
                style={{
                  display: "inline-block",
                  padding: "8px 12px",
                  borderRadius: "12px",
                  background: m.from === "user" ? "#2563eb" : "#f3f4f6",
                  color: m.from === "user" ? "#fff" : "#111827",
                  maxWidth: "70%",
                  whiteSpace: "pre-wrap",
                }}
              >
                {m.text}
              </span>
              <div style={{ fontSize: 12, color: "#6b7280" }}>{m.time}</div>
            </div>
          ))}
          {isTyping && <p>Assistant is typing...</p>}
          <div ref={chatEndRef} />
        </div>

        <div style={{ marginTop: "12px", display: "flex", gap: 8 }}>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={2}
            style={{ flex: 1, padding: 8 }}
            placeholder="Describe your symptoms..."
          />
          <button onClick={sendMessage}>Send</button>
        </div>
      </div>
    </>
  );
}

export default HealthChat;
