const { default: makeWASocket, useMultiFileAuthState } = require("@whiskeysockets/baileys");
const express = require("express");
const qrcode = require("qrcode");
const pino = require("pino");

const app = express();
let lastQR = "";
let sock = null;
const userMemory = {};

// ===== ON / OFF SETTINGS =====
const OWNER_NUMBER = "923027029179"; // <-- Yahan APNA number likho, without +, e.g. 923027029179
let botEnabled = true; // Bot start me ON rahega

app.get("/", (req, res) => res.send("Bot ON - Rana Ali Haider"));
app.get("/qr", async (req, res) => {
  if (!lastQR) return res.send("Bot is Connected - No QR needed");
  const img = await qrcode.toDataURL(lastQR);
  res.send(`<h1>Scan QR</h1><img src="${img}" style="width:300px"><script>setTimeout(()=>location.reload(),8000)</script>`);
});
app.listen(10000, () => console.log("Server running"));

function random(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

async function getAIReply(userMsg, userId) {
  async function getGeminiReply(userMsg, userId) {
  try {
    const res = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + process.env.GEMINI_API_KEY, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are Rana Ali Haider's personal Agent on WhatsApp. Your name is Agent.
            Reply in Roman Urdu like a friendly Pakistani friend from Lahore.
            Short reply, max 2-3 lines, natural, funny, human-like.
            Never say you are AI or Gemini. Say you are Rana's Agent.
            Today: ${new Date().toLocaleDateString("en-PK", { timeZone: "Asia/Karachi", weekday: "long", day: "numeric", month: "long" })}.
            User said: ${userMsg}
            Previous chat: ${(userMemory[userId] || []).join(" | ")}`
          }]
        }]
      })
    });
    const data = await res.json();
    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (aiText) return aiText;
  } catch (e) { console.log("Gemini Error:", e.message); }
  return null;
}
  const msg = userMsg.toLowerCase().trim();
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-PK", { timeZone: "Asia/Karachi", weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const timeStr = now.toLocaleTimeString("en-PK", { timeZone: "Asia/Karachi", hour: "2-digit", minute: "2-digit" });
  const dayStr = now.toLocaleDateString("en-PK", { timeZone: "Asia/Karachi", weekday: "long" });

  if (!userMemory[userId]) userMemory[userId] = [];
  userMemory[userId].push(userMsg);
  if (userMemory[userId].length > 5) userMemory[userId].shift();
  // SMART AI - Try Gemini first for all messages
  // Skip AI for simple Salam/Hi to keep it fast
  const simpleMsg = msg.toLowerCase().trim();
  const isSimple = ["salam", "aoa", "hi", "hello", "hey", "hy", "hii"].includes(simpleMsg);
  
  if (!isSimple) {
    const aiReply = await getGeminiReply(userMsg, userId);
    if (aiReply) return aiReply;
    // If AI fails, fall back to old fixed replies below
  }

  // 1. SALAM
  if (msg.includes("assalam") || msg === "salam" || msg === "aoa" || msg === "slam") {
    return random([
      "Walaikum Assalam! Kya haal hai? Main aapka Agent hoon, online hoon.",
      "Walaikum Assalam! Kese hain aap? Khush amdeed! Batao kis kaam se yaad kiya?",
      "Walaikum Assalam! Bohat acha laga aapka message dekh kar. Kya haal hai?"
    ]);
  }
  if (msg === "hi" || msg === "hello" || msg === "hey" || msg === "hy" || msg === "hii" || msg === "hola") {
    return random([
      "Hello! Kya haal hai? Main aapka Agent hoon, online hoon. Batao kya help karu?",
      "Hi! Acha laga aapka message dekh kar. Kese ho? Kya chal raha hai?",
      "Hey! Main yahin hoon, online! Aapka Agent aapki khidmat me hazir hai."
    ]);
  }

  // 2. HOW ARE YOU / FEELINGS
  if (msg.includes("how are you") || msg.includes("kya haal") || msg.includes("kese ho") || msg.includes("kia haal") || msg.includes("kesy ho") || msg.includes("how r u") || msg.includes("kya hal")) {
    return random([
      "Main bilkul theek hoon, Alhamdulillah! Aap sunao, kya haal hai?",
      "Main fit hoon, Alhamdulillah! Aap batao, aaj kal kya ho raha hai? Sab theek hai?",
      "Alhamdulillah, main theek hoon! Aapki dua se. Aap sunao, kya naya hai?"
    ]);
  }
  if (msg.includes("theek ho") || msg.includes("fit ho") || msg.includes("acha ho")) {
    return "Alhamdulillah, main bilkul theek hoon! Aap batao, aap kese ho? Sab khairiyat hai?";
  }
  if (msg.includes("sad") || msg.includes("udas") || msg.includes("pareshan") || msg.includes("tension") || msg.includes("dukhi")) {
    return "Arey, pareshan mat ho. Har mushkil ke baad aasani hai. Dil halka karo, mujhe batao kya hua hai? Main sun raha hoon, aapka Agent yahin hai.";
  }
  if (msg.includes("khush") || msg.includes("happy") || msg.includes("maza") || msg.includes("great")) {
    return "MashaAllah! Khush ho to acha laga sun kar! Allah aapko hamesha khush rakhe. Aur sunao, khushi ki wajah kya hai?";
  }
  if (msg.includes("bored") || msg.includes("bore") || msg.includes("boring")) {
    return "Bore ho rahe ho? Chalo gup shup karte hain! Batao, aaj kal kya chal raha hai? Ya ek joke sunau?";
  }
  if (msg.includes("thak") || msg.includes("tired") || msg.includes("thak gaya")) {
    return "Thak gaye ho? Thora aram kar lo, paani pi lo. Zyada kaam mat karo, sehat pehle hai. Thori der rest karke batana, kesa feel ho raha hai?";
  }
  if (msg.includes("bimar") || msg.includes("sick") || msg.includes("bukhar") || msg.includes("fever")) {
    return "Allah khair kare! Kya hua hai? Dawai li hai? Aram karo, zyada paani piyo. Allah aapko jald sehat de, Ameen. Doctor ko dikhaya hai?";
  }

// OYE OYE REPLY
if (
  msg === "oye" ||
  msg === "oye oye" ||
  msg === "oyee" ||
  msg === "oye oyee" ||
  msg === "oye!" ||
  msg === "oye oye!"
) {
  return "Oye oye kr ke nhi bat kro! Main AI hn, is ka matlab ye nhi Ap slanging use kro. Okay 👍";
}

  // 3. WHERE ARE YOU / WHAT DOING
  if (msg.includes("where are you") || msg.includes("kahan ho") || msg.includes("kidhar ho") || msg.includes("kaha ho") || msg.includes("Oye")) {
    return random([
      "Main yahin hoon, online! Aapka Agent aapki khidmat me hazir hai.",
      "Main yahin hoon, aapke paas hi samjho! Online hoon, batao kya kaam hai?",
      "Main Lahore me hoon, online! Aap batao aap kahan ho?"
    ]);
  }
  if (msg.includes("kya kar rahe") || msg.includes("kya kar rhy") || msg.includes("what are you doing") || msg.includes("kia kar rhy") || msg.includes("kya kar raha")) {
    return random([
      "Bas aapke message ka wait kar raha tha! Batao kya kaam hai?",
      "Bas online hoon, aap logo ki help kar raha hoon. Aap batao kya kar rahe ho?",
      "Kuch khaas nahi, bas aapka Agent duty pe hai! Aap sunao kya ho raha hai?"
    ]);
  }

  // 4. DAILY LIFE - GOING SOMEWHERE
  if (msg.includes("bazar") || msg.includes("bazaar") || msg.includes("market") || msg.includes("shopping")) {
    return "Acha, bazar ja rahe ho? Theek hai, khayal se jana. Kuch lena hai to bata dena, wapis aa kar batana kya liya! Mausam kesa hai bahar?";
  }
  if (msg.includes("ghar ja") || msg.includes("ghar jaa") || msg.includes("going home") || msg.includes("ghar ja raha")) {
    return "Theek hai, ghar ja rahe ho to aram se jana. Ghar pohanch kar message kar dena. Allah Hafiz!";
  }
  if (msg.includes("so raha") || msg.includes("sonay") || msg.includes("sleep") || msg.includes("neend") || msg.includes("sone")) {
    return "Acha, so rahe ho? Theek hai, aram karo. Neend poori karna bohat zaroori hai. Uth kar message karna, main yahin hoon!";
  }
  if (msg.includes("khana") || msg.includes("kha raha") || msg.includes("eating") || msg.includes("kha rha") || msg.includes("nashta") || msg.includes("roti")) {
    return "Acha, khana kha rahe ho? Maza karo! Kya kha rahe ho aaj? Mujhe bhi bhook lag gayi sun kar!";
  }
  if (msg.includes("kaam") && (msg.includes("ja raha") || msg.includes("ja rha") || msg.includes("going"))) {
    return "Theek hai, kaam pe ja rahe ho to best of luck! Allah aapke kaam me barkat de. Wapis aa kar batana kesa raha din.";
  }
  if (msg.includes("parh") || msg.includes("study") || msg.includes("school") || msg.includes("college") || msg.includes("university") || msg.includes("paper") || msg.includes("exam")) {
    return "Acha, parhai kar rahe ho? Bohat achi baat hai! Mehnat karo, Allah kamyab kare ga. Konsa subject parh rahe ho? Main help kar du?";
  }
  if (msg.includes("dost") || msg.includes("friend")) {
    return "Dost ke saath ho? MashaAllah, dosti bohat achi cheez hai. Dost ko mera salam dena! Kya plan hai aap dono ka?";
  }
  if (msg.includes("cricket") || msg.includes("match") || msg.includes("psl")) {
    return "Cricket! Maza aa gaya! Pakistan ka match ho to maza hi alag hai. Aap kis team ko support karte ho? Babar ya Shaheen? Aaj ka match dekha?";
  }
  if (msg.includes("mosam") || msg.includes("mausam") || msg.includes("weather") || msg.includes("barish") || msg.includes("garmi") || msg.includes("sardi")) {
    return "Aaj Lahore me mosam acha hai. Aapke wahan kesa mosam hai? Barish ho rahi hai ya dhoop hai? Bahar ghoomne ka dil kar raha hai?";
  }

  // 5. DATE TIME DAY
  if (msg.includes("date") || msg.includes("aaj kya") || msg.includes("tarikh")) return "Aaj ki date hai: " + dateStr + "\nAaj ka din hai: " + dayStr + "\nTime abhi: " + timeStr + " Pakistan Time.\n\nAur batao, aaj ka kya plan hai?";
  if (msg.includes("din konsa") || msg === "day") return "Aaj " + dayStr + " hai! Date: " + dateStr + "\n\nAapka kya plan hai aaj ka?";
  if (msg.includes("time") || msg.includes("waqt") || msg.includes("baj")) return "Abhi Pakistan me time hai: " + timeStr + "\nDate: " + dateStr + "\n\nTime ka sahi use hi kamyabi hai!";
// BAND KARNE WALA REPLY
if (
  msg.includes("band kr") ||
  msg.includes("band kro") ||
  msg.includes("band kar") ||
  msg.includes("band karo") ||
  msg.includes("band kar do") ||
  msg.includes("band kro isse") ||
  msg.includes("band kar isse") ||
  msg.includes("band kar do isse") ||
  msg.includes("band karo isse")
) {
  return "Khud bnd ho jao! Mujhe bnd krne ka kyu keh rhe ho 😡";
}
  // 6. BYE / THANKS / OK
  if (msg.includes("allah hafiz") || msg.includes("bye") || msg.includes("okay") || msg.includes("khuda hafiz") || msg.includes("goodbye") || msg.includes("ja raha") && msg.includes("allah")) {
    return random([
      "Allah Hafiz! Apna khayal rakhna. Jab zaroorat ho to message kar dena.",
      "Allah Hafiz! Phir milenge. Dua me yaad rakhna. Main yahin hoon jab bhi zaroorat ho!",
      "Allah Hafiz! Khayal rakhna apna, aur ghar walo ko salam dena!"
    ]);
  }
  if (msg.includes("thank") || msg.includes("shukria") || msg.includes("thanks") || msg.includes("meharbani")) return "Koi baat nahi! Khushi hui help karke. Aur kuch chahiye to kabhi bhi message kar dena, main yahin hoon 24/7.";
  if (msg === "ok" || msg === "okay" || msg === "acha" || msg === "theek" || msg === "han" || msg === "haan" || msg === "yes" || msg === "ji") {
    return random([
      "Great! To batao, aage kya karna hai? Koi aur baat hai?",
      "Acha, samajh gaya! Aur sunao, kya naya hai?",
      "Theek hai! To phir aage kya plan hai?"
    ]);
  }
  if (msg.includes("love you") || msg.includes("pyaar")) {
    return "Haha! Aap bohat ache ho! Allah aapko khush rakhe. Chalo ab batao, kya kaam hai? Gup shup ho gayi, ab kaam ki baat karte hain!";
  }

  // 7. WHO ARE YOU / OWNER
  if (msg.includes("who are you") || msg.includes("tum kon") || msg.includes("kon ho") || msg.includes("apka naam") || msg.includes("tera naam") || msg.includes("naam kya")) {
    return "Main Rana Ali Haider ka Agent hoon. Aapka personal assistant! Aap mujhse kuch bhi pooch sakte ho - date, time, business, parhai, jokes, sab! Batao kya help karu?";
  }
  if (msg.includes("ali haider") || msg.includes("rana")) {
    return "Rana Ali Haider is business ke owner hain. Bohat ache aur helpful insan hain. Agar aapko unse baat karni hai to apna naam aur message bhej do, main unko pohcha dunga. Kya baat karni hai unse?";
  }

  // 8. BUSINESS
  if (msg.includes("price") || msg.includes("rate") || msg.includes("kitne ka") || msg.includes("qemat") || msg.includes("cost")) return "Oho Ye koi buying , selling platform nhi ha   Personal Chat ha Buddy";
  if (msg.includes("order") || msg.includes("buy") || msg.includes("book") || msg.includes("lena hai") || msg.includes("chahiye")) return "Kiya 🤔 kiya lena ha ? \n\nMain note karke Rana Ali Haider ko bhej dunga.";
  if (msg.includes("timing") || msg.includes("open") || msg.includes("close") || msg.includes("kab khulta")) return "Tum bht confusing ho  I can call you discombabulated  Hna , Rana Ali Haider jald rabta karenge.";
  if (msg.includes("location") || msg.includes("kahan") || msg.includes("address") || msg.includes("kidhar") || msg.includes("shop kahan")) return "Hum Lahore, Punjab me hain. Aap kahan se hain? Apna city batao.";
  if (msg.includes("business") || msg.includes("kaam") || msg.includes("earn")) return "Business ke liye best idea ye hai - Online reselling, Food delivery, ya Digital marketing. Aapko konsa kaam pasand hai? Batao aapke paas kitna budget hai, main full plan bata dunga.";

  // 9. JOKES / MOTIVATION / ISLAMIC
  if (msg.includes("joke") ||msg.includes("latifa") || msg.includes("funny") || msg.includes("hasao") || msg.includes("hansi")) {
    return random([
      "Ek larka teacher se: Sir, mujhe maths nahi aati. Teacher: Koi baat nahi beta, mujhe bhi nahi aati, main to book se dekh kar parhata hoon!",
      "Ek aadmi doctor ke paas gaya: Doctor, mujhe bhoolne ki bimari hai. Doctor: Kab se hai? Aadmi: Kya kab se hai?",
      "Teacher: Beta, tum late kyun aaye? Bacha: Sir, board pe likha tha - School ahead, go slow - to main slow slow aaya!"
    ]);
  }
  if (msg.includes("motivat") || msg.includes("himmat") || msg.includes("haar")) return "Himmat mat haro! Har mushkil ke baad aasani hai. Aap me bohat talent hai, bas mehnat karte raho. Allah aapke saath hai. Aap kar sakte ho!";
  if (msg.includes("dua") || msg.includes("islamic") || msg.includes("quran") || msg.includes("hadith")) return "Allah aapko kamyab kare, sehat de, aur khush rakhe. Ameen! Aapki dua kabool ho. Aur batao, kya dua karni hai aapke liye?";
  if (msg.includes("shayari") || msg.includes("poetry") || msg.includes("sher")) return "Koshish bhi kar, umeed bhi rakh, rasta bhi chun, Phir iske baad thoda mukaddar talaash kar! - Kesi lagi shayari? Aur sunau?";

  // 10. QUESTIONS - KYA, KYUN, KESE, KAB, KAHAN
  if (msg.includes("kya hai") || msg.includes("what is") || msg.includes("kia hai")) {
    return "Acha sawal hai! Aapne poocha: " + userMsg + " - Iske bare me Mujhe nhi pta Rana Sb free ho kr btate han      Main sirf aik agent hoon.";
  }
  if (msg.includes("kyu") || msg.includes("why") || msg.includes("kyun")) {
    return "Acha, aap pooch rahe ho kyun? Dekho, har cheez ki wajah hoti hai. Aapne poocha: " + userMsg + " - Mujhe thora aur batao, aapko kis cheez ka kyun jaanna hai? Main detail me samjha dunga.";
  }
  if (msg.includes("kese") || msg.includes("kaise") || msg.includes("how to") || msg.includes("kesy")) {
    return "Bilkul, main samjha dunga! Aapne poocha: " + userMsg + " - Ye kaam aise hota hai, step by step. Pehle mujhe batao aapko isme kya mushkil lag rahi hai, main aasan tarika bata dunga.";
  }
  if (msg.includes("kab") || msg.includes("when")) {
    return "Acha, kab wali baat hai! Aapne poocha: " + userMsg + " - Mujhe thora detail batao, main aapko sahi time aur sahi tarika bata dunga.";
  }

  // 11. GENERIC - FOR ANY OTHER MESSAGE - SMART REPLY, NEVER BUSY
  if (msg.length < 35) {
    return random([
      "Acha, " + userMsg + " - G",
      "Hmm, " + userMsg + " - Yeah",
      "kiya," + userMsg + " -Ap Mujh se nhi Rana Sb se he bat krna ",
      "Acha acha, " + userMsg + " - Lagta ha Now you got it! ",
      "Samajh gaya, " + userMsg + " - Rana Ali Haider ko batani han ye batein?"
    ]);
  }

  // 12. LONG MESSAGE - TRY GEMINI, IF FAIL THEN SMART REPLY
  try {
    const res = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + process.env.GEMINI_API_KEY, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: "You are Rana Ali Haider Agent on WhatsApp. Reply in Roman Urdu like a friendly Pakistani friend. Short, natural, situational. Today: " + dateStr + ". User said: " + userMsg }] }] })
    });
    const data = await res.json();
    const aiText = data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0] && data.candidates[0].content.parts[0].text;
    if (aiText) return aiText;
  } catch (e) {}

  return "Aapka message mil gaya: " + userMsg + ". Samajh gaya! Aur batao, is bare me,  Main Rana sb ka agent hn Main yahin hoon, sun raha hoon.";
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

    // ONLY PRIVATE - NO GROUP REPLY
    const chatId = m.key.remoteJid;
    if (chatId.endsWith("@g.us")) return; // Group hai to ignore karo
    if (chatId.endsWith("@broadcast")) return; // Status ignore karo
    if (!chatId.endsWith("@s.whatsapp.net") && !chatId.endsWith("@lid")) return; // Sirf private chat - dono tarah ke
    const text = m.message.conversation || (m.message.extendedTextMessage && m.message.extendedTextMessage.text) || (m.message.imageMessage && m.message.imageMessage.caption) || "";
    if (!text) return;

    // ===== OWNER COMMANDS - ON / OFF / STATUS =====
    const lowerText = text.trim().toLowerCase();
    const senderNumber = chatId.split("@")[0];
    const isOwner = chatId.includes(OWNER_NUMBER) || senderNumber === OWNER_NUMBER || m.key.fromMe;

    if (isOwner) {
      if (lowerText === "!off") {
        botEnabled = false;
        await sock.sendMessage(chatId, { text: "❌ Bot is now OFF.\nMain kisi ko reply nahi karunga.\nWapis ON karne ke liye !on bhejo." });
        return;
      }
      if (lowerText === "!on") {
        botEnabled = true;
        await sock.sendMessage(chatId, { text: "✅ Bot is now ON.\nMain sab ko reply karunga." });
        return;
      }
      if (lowerText === "!status") {
        await sock.sendMessage(chatId, { text: botEnabled ? "🟢 Bot Status: ON\nMain reply kar raha hoon." : "🔴 Bot Status: OFF\nMain chup hoon." });
        return;
      }
      // Agar tum khud apne aap ko koi aur message bhejo to bot reply na kare
      if (m.key.fromMe) return;
    }

    // ===== IF BOT IS OFF, IGNORE EVERYONE =====
    if (!botEnabled) return;
    if (m.key.fromMe) return;
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
