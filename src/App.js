import React, { useState, useRef, useEffect } from "react";
import { GoogleGenAI } from "@google/genai"; // Import from the correct package
import "./App.css";

const API_KEY = process.env.API_KEY;

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    // Add user message
    setMessages((prev) => [...prev, { text: input, sender: "user" }]);
    setInput("");
    setLoading(true);

    // Add placeholder bot message
    setMessages((prev) => [
      ...prev,
      { text: "Thinking...", sender: "bot", isPlaceholder: true },
    ]);

    // Generation config
    const generationConfig = {
      stopSequences: ["red"],
      maxOutputTokens: 200,
      temperature: 0.9,
      topP: 0.1,
      topK: 16,
    };

    // Safety settings (optional)
    const safetySettings = []; // Customize if needed

    try {
      const ai = new GoogleGenAI({ apiKey: API_KEY });

      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: [{ role: "user", parts: [{ text: input }] }],
        safetySettings,
        generationConfig,
      });

      const botMessage = {
        text:
          response?.candidates?.[0]?.content?.parts?.[0]?.text ||
          "⚠️ No response",
        sender: "bot",
      };

      setMessages((prev) => {
        const updated = [...prev];
        const index = updated.findIndex((msg) => msg.isPlaceholder);
        if (index !== -1) updated[index] = botMessage;
        return updated;
      });
    } catch (err) {
      setMessages((prev) => {
        const updated = [...prev];
        const index = updated.findIndex((msg) => msg.isPlaceholder);
        if (index !== -1)
          updated[index] = { text: "⚠️ Error: " + err.message, sender: "bot" };
        return updated;
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <div className="chat-container">
      <div className="chat-header">AI Chatbot 🤖</div>
      <div className="chat-body">
        {messages.map((msg, i) => (
          <div key={i} className={`chat-message ${msg.sender}`}>
            {msg.text}
          </div>
        ))}
        <div ref={chatEndRef}></div>
      </div>
      <div className="chat-footer">
        <input
          type="text"
          value={input}
          placeholder="Type your message..."
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
        />
        <button onClick={sendMessage}>➤</button>
      </div>
    </div>
  );
}

export default App;
