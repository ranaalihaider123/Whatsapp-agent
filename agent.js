const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode");
const express = require("express");
const app = express();

let lastQR = "";
let botOn = true;
let userMemory = {};

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: { headless: true, args: ["--no-sandbox", "--disable-setuid-sandbox"] }
});

client.on("qr", async (qr) => {
  lastQR = qr;
  console.log("QR READY");
});

client.on("ready", () => console.log("BOT READY!"));
client.on("disconnected", () => console.log("Disconnected - Retrying"));

// Keep Render awake
app.get("/", (req, res) => {
  if (!lastQR) return res.send("Bot is Connected - No QR needed");
  qrcode.toDataURL(lastQR, (err, url) => {
    res.send(`<h1>Scan QR</h1><img src="${url}" style="width:300px">`);
  });
});
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log("Server running on " + PORT));

function random(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

// --- AI FUNCTION - BAHAR HAI, AB CHALEGA ---
async function getGeminiReply(userMsg, userId) {
  try {
    const res = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + process.env.GEMINI_API_KEY, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `You are Rana Ali Haider's personal Agent on WhatsApp. Your name is Agent. Reply in Roman Urdu like a friendly Pakistani friend from Lahore. Short reply, max 2-3 lines, natural, funny, human-like. Never say you are AI or Gemini. Say you are Rana's Agent. User said: ${userMsg}. Previous chat: ${(userMemory[userId] || []).join(" | ")}` }] }]
      })
    });
    const data = await res.json();
    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (aiText) return aiText;
    console.log("Gemini API Reply Empty:", JSON.stringify(data).slice(0, 200));
  } catch (e) { console.log("Gemini Error:", e.message); }
  return null;
}

// --- MAIN REPLY FUNCTION ---
async function getAIReply(userMsg, userId) {
  const msg = userMsg.toLowerCase().trim();

  if (!userMemory[userId]) userMemory[userId] = [];
  userMemory[userId].push(userMsg);
  if (userMemory[userId].length > 5) userMemory[userId].shift();

  // ON / OFF - Sirf tumhare liye
  if (msg === "!off") { botOn = false; return "Bot OFF kar diya hai. Wapis ON karne ke liye !on likho."; }
  if (msg === "!on") { botOn = true; return "Bot ON ho gaya! 🟢 Ab main sab ko reply karunga."; }
  if (msg === "!status") return botOn ? "Bot is ON 🟢" : "Bot is OFF 🔴";

  if (!botOn) return null;

  // Fast replies for Salam / Hi
  if (["salam", "aoa", "assalam"].includes(msg)) return "Walaikum Assalam! Kese ho? 😊";
  if (["hi", "hello", "hey", "hy", "hii"].includes(msg)) return "Hi! Kese ho? Batao kya kaam hai?";

  // SMART AI - Har message ke liye
  const aiReply = await getGeminiReply(userMsg, userId);
  if (aiReply) return aiReply;

  // Agar AI fail ho jaye to backup
  return "Bhai thora busy hun, zara ruk ke phir message karo. 😅";
}

client.on("message", async (msg) => {
  try {
    // Sirf Private Chat me reply
    const chat = await msg.getChat();
    if (chat.isGroup) return;
    if (msg.fromMe) return;
    if (msg.hasMedia) return;

    const body = msg.body;
    if (!body) return;

    console.log("MSG:", body);
    const reply = await getAIReply(body, msg.from);
    if (reply) await msg.reply(reply);
  } catch (e) { console.log("Error:", e.message); }
});

client.initialize();
