const express = require("express");
const router = express.Router();
const axios = require("axios");
const db = require("../firebaseAdmin"); // firestore

router.post("/chat", async (req, res) => {
  const { message, userId } = req.body;

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.AIzaSyCzQzuH5B - oxBzywUXxoos4Zs5zq7brxvQ}`,
      {
        contents: [
          {
            parts: [{ text: message }],
          },
        ],
      },
    );

    const reply = response.data.candidates[0].content.parts[0].text;

    const uid = userId || "guest";

    // 🔥 SAVE CHAT TO FIRESTORE
    console.log("Saving chat to firestore...");

    await db.collection("chatHistory").add({
      userId: uid,
      userMessage: message,
      aiReply: reply,
      timestamp: new Date(),
    });

    res.json({ reply });
  } catch (error) {
    console.log("AI ERROR:", error.message);
    res.status(500).json({ reply: "AI error" });
  }
});

module.exports = router;
