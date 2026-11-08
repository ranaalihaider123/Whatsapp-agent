const { default: makeWASocket, useMultiFileAuthState } = require("@whiskeysockets/baileys");
const express = require("express");
const qrcode = require("qrcode");
const pino = require("pino");

const app = express();
let lastQR = "";
let sock = null;
const userMemory = {};

app.get("/", (req, res) => res.send("Bot ON - Rana Ali Haider AI"));
app.get("/qr", async (req, res) => {
  if (!lastQR) return res.send("Bot is Connected");
  const img = await qrcode.toDataURL(lastQR);
  res.send(`<h1>Scan QR</h1><img src="${img}" style="width:300px"><script>setTimeout(()=>location.reload(),8000)</script>`);
});
app.listen(10000, () => console.log("Server running"));

function random(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

async function askGemini(userMsg, userId, dateStr) {
 const models = ["gemini-3-8-flash", "gemini-2.0-flash", "gemini-2.0-flash-lite", "gemini-1.5-flash-001"];
  const history = (userMemory[userId] || []).join(" | ");
  for (const model of models) {
    try {
      const res = await fetch("https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent?key=" + process.env.GEMINI_API_KEY, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: "You are Rana Ali Haider AI Assistant on WhatsApp, like ChatGPT. Answer ANY question. Reply in SAME language user used - Roman Urdu if user uses Roman Urdu, English if English. Be friendly, natural, varied, never repeat same sentence. Today: " + dateStr + ". Past chat: " + history + ". User said: " + userMsg }] }]
        })
      });
      const data = await res.json();
      if (data.error) { console.log("Gemini Error " + model + ":", data.error.message); continue; }
      const aiText = data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0] && data.candidates[0].content.parts[0].text;
      if (aiText) return aiText;
    } catch (e) { console.log("Gemini Fail " + model, e.message); }
  }
  return null;
}

async function getAIReply(userMsg, userId) {
  const msg = userMsg.toLowerCase().trim();
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-PK", { timeZone: "Asia/Karachi", weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const timeStr = now.toLocaleTimeString("en-PK", { timeZone: "Asia/Karachi", hour: "2-digit", minute: "2-digit" });
  const dayStr = now.toLocaleDateString("en-PK", { timeZone: "Asia/Karachi", weekday: "long" });

  if (!userMemory[userId]) userMemory[userId] = [];
  userMemory[userId].push(userMsg);
  if (userMemory[userId].length > 6) userMemory[userId].shift();

  // STEP 1 - ONLY VERY SHORT GREETINGS - FAST LOCAL (Taake turant reply aaye)
  if (msg === "salam" || msg === "aoa" || msg === "assalam o alaikum" || msg === "assalam") {
    return "Walaikum Assalam! Kya haal hai? Main aapka Agent hoon, online hoon. Batao kya help karu?";
  }
  if (msg === "hi" || msg === "hello" || msg === "hey" || msg === "hy") {
    return "Hello! Kya haal hai? Main aapka Agent hoon, online hoon. Batao kya help karu? Kuch bhi pooch sakte ho!";
  }
  if (msg === "allah hafiz" || msg === "bye" || msg === "goodbye") {
    return "Allah Hafiz! Apna khayal rakhna. Jab zaroorat ho to message kar dena, main yahin hoon!";
  }
  if (msg === "ok" || msg === "okay" || msg === "acha" || msg === "theek") {
    return "Theek hai! Aur batao, kya karna hai? Kuch bhi pooch sakte ho, main AI hoon!";
  }

  // STEP 2 - EVERYTHING ELSE - FIRST TRY REAL AI - 11 MILLION QUESTIONS
  const aiAnswer = await askGemini(userMsg, userId, dateStr);
  if (aiAnswer) return aiAnswer;

  // STEP 3 - AGAR AI FAIL HO JAYE (Key khatam) - TAB LOCAL BACKUP, KABHI BUSY NAHI BOLEGA
  if (msg.includes("how are you") || msg.includes("kya haal") || msg.includes("kese ho")) return "Main bilkul theek hoon, Alhamdulillah! Aap sunao, kya haal hai? Aapko kis cheez me help chahiye?";
  if (msg.includes("kahan ho") || msg.includes("where are you")) return "Main yahin hoon, online! Aapka Agent aapki khidmat me hazir hai. Batao kya kaam hai?";
  if (msg.includes("bazar")) return "Acha, bazar ja rahe ho? Theek hai, khayal se jana. Wapis aa kar batana kya liya!";
  if (msg.includes("khana")) return "Acha, khana kha rahe ho? Maza karo! Kya kha rahe ho aaj?";
  if (msg.includes("date") || msg.includes("tarikh")) return "Aaj ki date hai: " + dateStr + ", Din: " + dayStr + ", Time: " + timeStr + " Pakistan Time.";
  if (msg.includes("time") || msg.includes("waqt")) return "Abhi Pakistan me time hai: " + timeStr + ", Date: " + dateStr;
  if (msg.includes("price") || msg.includes("rate")) return "Price ke liye batao - kya chahiye aur kitni quantity? Rana Ali Haider aapko best rate denge. Aapka naam aur city kya hai?";
  if (msg.includes("order") || msg.includes("buy")) return "Zaroor! Order ke liye batao: 1. Naam 2. City 3. Kya chahiye? 4. Kitne piece? Main note karke Rana Ali Haider ko bhej dunga.";
  if (msg.includes("joke")) return "Ek larka teacher se: Sir, mujhe maths nahi aati. Teacher: Koi baat nahi beta, mujhe bhi nahi aati, main to book se dekh kar parhata hoon!";
  if (msg.includes("who are you") || msg.includes("tum kon") || msg.includes("kon ho")) return "Main Rana Ali Haider ka AI Assistant hoon, ChatGPT jaisa. Mujhse kuch bhi pooch sakte ho - Science, Business, Parhai, Duniya ka koi bhi sawal!";

  // LAST FALLBACK - Kabhi busy nahi bolega
  return "Samajh gaya! Aapne kaha: " + userMsg + ". Is bare me thora aur detail batao, taake main aapko behtreen jawab du. Main aapka AI Assistant hoon, kuch bhi pooch sakte ho!";
}

async function start() {
  const { state, saveCreds } = await useMultiFileAuthState("auth");
  sock = makeWASocket({ auth: state, logger: pino({ level: "silent" }) });
  sock.ev.on("creds.update", saveCreds);
  sock.ev.on("connection.update", (u) => {
    if (u.qr) { lastQR = u.qr; console.log("QR READY"); }
    if (u.connection === "open") { console.log("BOT READY!"); lastQR = ""; }
    if (u.connection === "close") { console.log("Disconnected - Retrying"); start(); }
  });
  sock.ev.on("messages.upsert", async ({ messages }) => {
    const m = messages[0];
    if (!m.message || m.key.fromMe) return;
    const text = m.message.conversation || (m.message.extendedTextMessage && m.message.extendedTextMessage.text) || (m.message.imageMessage && m.message.imageMessage.caption) || "";
    if (!text) return;
    const userId = m.key.remoteJid;
    console.log("MSG:", text);
    try {
      await sock.sendPresenceUpdate("composing", userId);
      const reply = await getAIReply(text, userId);
      await sock.sendMessage(userId, { text: reply });
    } catch (e) { console.log("Send Error", e.message); }
  });
}
start();
