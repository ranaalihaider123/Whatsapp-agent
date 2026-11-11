const { default: makeWASocket, useMultiFileAuthState } = require("@whiskeysockets/baileys");
const express = require("express");
const qrcode = require("qrcode");
const pino = require("pino");

const app = express();
let lastQR = "";
let sock = null;

// ===== ON / OFF =====
const OWNER_NUMBER = "923001234567"; // Put your own number here without +
let botEnabled = true;

app.get("/", (req, res) => res.send("<h1>Bot is Running - English Medium</h1><a href='/qr'>Click for QR</a>"));
app.get("/qr", async (req, res) => {
  if (!lastQR) return res.send("<h2>Bot is Connected - No QR needed</h2>");
  const img = await qrcode.toDataURL(lastQR);
  res.send(`<h1>Scan QR</h1><img src="${img}" style="width:300px"><script>setTimeout(()=>location.reload(),8000)</script>`);
});
app.listen(10000, () => console.log("Server running"));

function random(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

// ===== ENGLISH REPLIES - NO FETCH, NO GEMINI =====
function getReply(userMsg) {
  const msg = userMsg.toLowerCase().trim();
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-PK", { timeZone: "Asia/Karachi", weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const timeStr = now.toLocaleTimeString("en-PK", { timeZone: "Asia/Karachi", hour: "2-digit", minute: "2-digit" });

  if (msg.includes("assalam") || msg === "salam" || msg === "aoa" || msg === "slam") {
    return { text: random([
      "Walaikum Assalam! How are you? I am your Agent, I am online.",
      "Walaikum Assalam! Nice to hear from you. How can I help you?",
      "Walaikum Assalam! Welcome! Tell me, what do you need?"
    ]), sticker: true };
  }
  if (msg === "hi" || msg === "hello" || msg === "hey" || msg === "hy" || msg === "hii") {
    return { text: random([
      "Hello! How are you? I am your Agent, I am online. How can I help you?",
      "Hi! Good to see your message. How are you? What is going on?",
      "Hey! I am here, online! Your Agent is ready to help."
    ]), sticker: false };
  }
  if (msg.includes("how are you") || msg.includes("kya haal") || msg.includes("kese ho") || msg.includes("kesy ho")) {
    return { text: "I am perfectly fine, Alhamdulillah! How about you? What is new?", sticker: false };
  }
  if (msg.includes("sad") || msg.includes("udas") || msg.includes("pareshan") || msg.includes("tension")) {
    return { text: "Don't worry. Every difficulty comes with ease. Tell me what happened, I am listening. I am here for you.", sticker: false };
  }
  if (msg.includes("joke") || msg.includes("funny") || msg.includes("hasao")) {
    return { text: random([
      "Why did the student eat his homework? Because the teacher said it was a piece of cake!",
      "Teacher: Why are you late? Student: Because the sign said 'School Ahead, Go Slow' so I came slowly!",
      "Doctor: You have a forgetting problem. Patient: Since when? Doctor: Since when what?"
    ]), sticker: true };
  }
  if (msg.includes("date") || msg.includes("day") || msg.includes("time") || msg.includes("waqt")) {
    return { text: "Today is: " + dateStr + "\nCurrent Time in Pakistan: " + timeStr + "\nWhat is your plan for today?", sticker: false };
  }
  if (msg.includes("allah hafiz") || msg.includes("bye") || msg.includes("goodbye")) {
    return { text: "Allah Hafiz! Take care of yourself. Message me whenever you need help.", sticker: false };
  }
  if (msg.includes("thank") || msg.includes("shukria")) {
    return { text: "You are most welcome! Happy to help you. Message me anytime, I am here 24/7.", sticker: false };
  }
  if (msg.includes("who are you") || msg.includes("tum kon") || msg.includes("kon ho") || msg.includes("your name")) {
    return { text: "I am Rana Ali Haider's Agent. Your personal assistant! You can ask me anything - date, time, jokes, motivation. How can I help you?", sticker: false };
  }
  if (msg.includes("sticker")) {
    return { text: "Here is your sticker!", sticker: true };
  }
  // Default English reply for any other message
  return { text: "Got it! You said: " + userMsg + ". Tell me more about it, I am listening.", sticker: false };
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
    if (!m.message) return;
    const chatId = m.key.remoteJid;
    if (chatId.endsWith("@g.us")) return;
    if (chatId.endsWith("@broadcast")) return;
    if (!chatId.endsWith("@s.whatsapp.net") && !chatId.endsWith("@lid")) return;

    const text = m.message.conversation || m.message.extendedTextMessage?.text || m.message.imageMessage?.caption || "";
    if (!text) return;

    // ===== OWNER COMMANDS =====
    const lowerText = text.trim().toLowerCase();
    const senderNumber = chatId.split("@")[0];
    const isOwner = chatId.includes(OWNER_NUMBER) || senderNumber === OWNER_NUMBER || m.key.fromMe;

    if (isOwner) {
      if (lowerText === "!off") { botEnabled = false; await sock.sendMessage(chatId, { text: "Bot is now OFF. I will not reply to anyone. Send !on to turn ON." }); return; }
      if (lowerText === "!on") { botEnabled = true; await sock.sendMessage(chatId, { text: "Bot is now ON. I will reply to everyone." }); return; }
      if (lowerText === "!status") { await sock.sendMessage(chatId, { text: botEnabled ? "Bot Status: ON - I am replying." : "Bot Status: OFF - I am silent." }); return; }
      if (m.key.fromMe) return;
    }
    if (!botEnabled) return;
    if (m.key.fromMe) return;

    const userId = m.key.remoteJid;
    console.log("MSG:", text);
    try {
      await sock.sendPresenceUpdate("composing", userId);
      const reply = getReply(text);
      // If sticker is true, send sticker first, then text
      if (reply.sticker) {
        await sock.sendMessage(userId, { sticker: { url: "https://cdn.sticker.ly/sticker/full/abc123.webp" } });
      }
      await sock.sendMessage(userId, { text: reply.text });
    } catch (e) { console.log("Send Error", e.message); }
  });
}
start();
