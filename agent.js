const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require("@whiskeysockets/baileys");
const express = require("express");
const QRCode = require("qrcode");

const app = express();
const PORT = process.env.PORT || 10000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

let lastQR = "";
let sock = null;

// Gemini se jawab lena
async function getGeminiReply(userText) {
  if (!GEMINI_API_KEY) {
    return "Hello! Main Gemini Bot hun. Tumne kaha: " + userText;
  }
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: userText }] }]
        })
      }
    );
    const data = await response.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return reply || "Sorry, samajh nahi aaya. Dobara bolo.";
  } catch (e) {
    console.log("Gemini Error:", e.message);
    return "Sorry, thoda masla ho gaya. Dobara try karo.";
  }
}

// Website Routes
app.get("/", (req, res) => {
  res.send("<h1>Bot is Running!</h1><a href='/qr'>Click Here for QR</a>");
});

app.get("/qr", async (req, res) => {
  if (!lastQR) {
    return res.send("<h2>QR abhi ready nahi, 10 sec baad refresh karo</h2><script>setTimeout(()=>location.reload(),5000)</script>");
  }
  const img = await QRCode.toDataURL(lastQR);
  res.send(`<h1>WhatsApp QR Scan Karo</h1><img src="${img}" style="width:300px"><br><p>15 sec me auto refresh hoga</p><script>setTimeout(()=>location.reload(),15000)</script>`);
});

app.listen(PORT, () => console.log("Server running on " + PORT));

// WhatsApp Bot Start
async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("auth");
  sock = makeWASocket({ auth: state, printQRInTerminal: false });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect, qr } = update;
    if (qr) {
      lastQR = qr;
      console.log("NEW QR READY - Open /qr page");
    }
    if (connection === "close") {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log("Connection closed, reconnect:", shouldReconnect);
      if (shouldReconnect) startBot();
      else lastQR = "";
    } else if (connection === "open") {
      console.log("BOT READY!");
      lastQR = "";
    }
  });

  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const text = msg.message.conversation || msg.message.extendedTextMessage?.text || msg.message.imageMessage?.caption || "";
    if (!text) return;

    console.log("Message aaya:", text);

    const reply = await getGeminiReply(text);
    await sock.sendMessage(msg.key.remoteJid, { text: reply });
  });
}

startBot();
