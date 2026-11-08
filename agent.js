import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "mysecret123";
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;

// Groq - Free, Fast, No Gemini
async function getAIReply(userMessage) {
  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: "You are a friendly helpful assistant like Meta AI. Reply in the same language the user uses. If user writes in Roman Urdu / Hindi mixed English, reply in Roman Urdu. If user writes in English, reply in English. Keep replies short, natural, conversational, like a friend on WhatsApp. Never ask user to give more detail. Always answer directly. If user says 'Oye kiya' or 'Hanji', reply warmly and ask what happened. If user says 'History', explain in simple words."
          },
          { role: "user", content: userMessage }
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    });

    const data = await response.json();
    console.log("Groq Response:", JSON.stringify(data).slice(0, 500));

    if (data.choices && data.choices[0] && data.choices[0].message) {
      return data.choices[0].message.content;
    } else {
      console.log("Groq Error Full:", data);
      return "Sorry yaar, thora sa issue aa gaya. Dobara try karo, main yahin hoon.";
    }
  } catch (e) {
    console.log("Groq Fetch Error:", e.message);
    return "Sorry, network thora slow hai. Dobara bhejo.";
  }
}

// WhatsApp Webhook Verify
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];
  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// WhatsApp Webhook Receive
app.post("/webhook", async (req, res) => {
  try {
    const entry = req.body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const msg = value?.messages?.[0];
    if (!msg || !msg.text) return res.sendStatus(200);

    const from = msg.from;
    const userText = msg.text.body;
    console.log("User:", userText);

    const reply = await getAIReply(userText);
    console.log("Reply:", reply);

    await fetch(`https://graph.facebook.com/v21.0/${PHONE_NUMBER_ID}/messages`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${WHATSAPP_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: from,
        type: "text",
        text: { body: reply }
      })
    });
    res.sendStatus(200);
  } catch (e) {
    console.log("Webhook Error:", e.message);
    res.sendStatus(200);
  }
});

app.get("/", (req, res) => res.send("WhatsApp Bot with Groq is Live!"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on", PORT));
