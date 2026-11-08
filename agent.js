const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const pino = require('pino');

async function getGroqReply(userMessage) {
  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: 'You are Grok, a funny, smart, helpful WhatsApp assistant. Reply short, in same language as user. If user writes in Urdu/Roman Urdu, reply in Roman Urdu.' },
          { role: 'user', content: userMessage }
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    });
    const data = await res.json();
    return data.choices[0].message.content;
  } catch (e) {
    console.log('Groq Error:', e);
    return 'Sorry, brain is busy. Try again.';
  }
}

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('auth');
  
  const sock = makeWASocket({
    logger: pino({ level: 'silent' }),
    auth: state,
    printQRInTerminal: false
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;
    if (qr) {
      console.log('--- SCAN THIS QR WITH YOUR WHATSAPP ---');
      qrcode.generate(qr, { small: true });
    }
    if (connection === 'close') {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log('Connection closed, reconnecting:', shouldReconnect);
      if (shouldReconnect) startBot();
    } else if (connection === 'open') {
      console.log('CONNECTED! Your number is now Grok Bot ✅');
    }
  });

  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const text = msg.message.conversation || msg.message.extendedTextMessage?.text;
    if (!text) return;

    console.log('User:', text);
    const reply = await getGroqReply(text);
    console.log('Bot:', reply);

    await sock.sendMessage(msg.key.remoteJid, { text: reply });
  });
}

startBot();
