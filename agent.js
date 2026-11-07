const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const express = require('express');
const qrcode = require('qrcode');
const pino = require('pino');
const app = express();
let lastQR = '';
app.get('/', (req,res) => res.send('Bot ON'));
app.get('/qr', async (req,res) => {
  if(!lastQR) return res.send('Bot is Connected - No QR needed');
  const img = await qrcode.toDataURL(lastQR);
  res.send(`<h1>Scan QR</h1><img src="${img}" style="width:300px"><script>setTimeout(()=>location.reload(),8000)</script>`);
});
app.listen(10000, () => console.log('Server running'));
async function getAIReply(userMsg) {
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: `You are Rana Ali Haider's personal assistant on WhatsApp. Polite, helpful, professional, reply in same language as user (Urdu/English/Roman Urdu). Keep replies short, max 3-4 lines. If user asks price/timing/location and you don't know, say Rana Ali will confirm. User said: ${userMsg}` }] }] })
    });
    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, samajh nahi aaya. Dobara batayein?";
  } catch(e) { return "Sorry, thora masla hua hai. Rana Ali Haider jald rabta karenge."; }
}
async function start() {
  const { state, saveCreds } = await useMultiFileAuthState('auth');
  const sock = makeWASocket({ auth: state, logger: pino({level:'silent'}) });
  sock.ev.on('creds.update', saveCreds);
  sock.ev.on('connection.update', (u) => {
    if(u.qr){ lastQR = u.qr; console.log('QR READY'); }
    if(u.connection === 'open'){ console.log('BOT READY!'); lastQR=''; }
    if(u.connection === 'close'){ console.log('Disconnected - Retrying'); start(); }
  });
  sock.ev.on('messages.upsert', async ({messages}) => {
    const m = messages[0];
    if(!m.message || m.key.fromMe) return;
    const text = m.message.conversation || m.message.extendedTextMessage?.text || '';
    if(!text) return;
    const reply = await getAIReply(text);
    await sock.sendMessage(m.key.remoteJid, { text: reply });
  });
}
start();
