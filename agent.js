const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const express = require('express');
const QRCode = require('qrcode');
const pino = require('pino');

const app = express();
let qrCodeData = '';
let sock;

function random(arr){ return arr[Math.floor(Math.random()*arr.length)]; }

function getReply(text){
  text = text.toLowerCase().trim();
  
  if(text.includes('salam') || text.includes('assalam'))
    return random(["Walaikum Salam! How are you?","Walaikum Salam! Long time, where have you been?","Salam! Good to hear from you, how's everything?"]);
  
  if(text.includes('hello') || text.includes('hi') || text.includes('hey') || text.includes('hii'))
    return random(["Hey! How are you doing?","Hello! What's up?","Heyy! Where have you been busy these days?","Hi! Tell me, what's going on?"]);
  
  if(text.includes('kahan ho') || text.includes('where are you') || text.includes('where r u') || text.includes('kidhar'))
    return random(["I'm right here, where are you?","I'm at home, where are you roaming around?","Just here on my phone, you tell me where are you?"]);
  
  if(text.includes('oye') || text.includes('oy') || text.includes('sun') || text.includes('listen'))
    return random(["Yeah yeah, I'm listening, tell me 😄","Yes, say it, I'm here","Yeah, go ahead, I'm listening"]);
  
  if(text.includes('what are you doing') || text.includes('kya kar') || text.includes('whats up') || text.includes("what's up"))
    return random(["Just chilling, what about you?","Nothing much, just passing time. What are you up to?","Just waiting for your message 😅 What are you doing?"]);
  
  if(text.includes('how are you') || text.includes('kese ho') || text.includes('kaise ho') || text.includes('how r u') || text.includes('whats going'))
    return random(["I'm doing great, what about you?","Alhamdulillah I'm fine, how are you?","I'm good, just alive 😂 How are you?"]);
  
  if(text.includes('bye') || text.includes('allah hafiz') || text.includes('going') || text.includes('good night') || text.includes('goodnight'))
    return random(["Okay then, talk to you later, take care!","Alright, bye! Come back soon","Good night, take care and talk soon!"]);
  
  if(text.includes('khana') || text.includes('food') || text.includes('hungry') || text.includes('bhook') || text.includes('eat'))
    return random(["Now you made me hungry too 😂 Did you eat?","Go and eat something, take care of your health"]);
  
  if(text.includes('bore') || text.includes('bored') || text.includes('boring'))
    return random(["Bored? Let's talk about something fun","Let's play a game or you tell me a story"]);
  
  if(text.includes('love') || text.includes('miss'))
    return random(["Aww 🥺 Miss you too","So much love? 😅"]);
  
  if(text.includes('haha') || text.includes('lol') || text.includes('😂') || text.includes('funny'))
    return random(["Hahaha 😂 That's funny","You always make me laugh 😂"]);
  
  if(text.includes('who are you') || text.includes('kon ho') || text.includes('kaun ho') || text.includes('your name'))
    return random(["I'm your friend, your AI friend 😎","I'm Rana's smart assistant, I'm always online for you"]);
  
  if(text.includes('thank') || text.includes('shukria'))
    return random(["No problem at all, anytime!","Don't mention it, we're friends"]);
  
  if(text.includes('good morning'))
    return random(["Good morning! How did you sleep?","Good morning! Have a great day ahead!"]);
  
  if(text.includes('good evening'))
    return random(["Good evening! How was your day?","Good evening! How are you doing?"]);

  if(text.includes('sad') || text.includes('tired') || text.includes('upset') || text.includes('depress'))
    return random(["Hey, don't worry, everything will be fine. Tell me what happened?","It's okay, I'm here. Tell me what's bothering you?"]);
  
  if(text.includes('ok') || text.includes('okay') || text.includes('acha') || text.includes('theek'))
    return random(["Okay cool, and then?","Alright, tell me more","Okay, got it. What else?"]);

  // Default - different every time, in English, according to situation
  return random([
    "Hmm interesting, tell me a little more in detail",
    "Oh really? And then what happened?",
    "Okay that's good, what else is going on?",
    "I see, tell me more about it",
    "Wow, that's new. Tell me more"
  ]);
}

async function startBot(){
  const { state, saveCreds } = await useMultiFileAuthState('auth_info');
  sock = makeWASocket({ auth: state, logger: pino({level:'silent'}), printQRInTerminal: false });
  sock.ev.on('creds.update', saveCreds);
  sock.ev.on('connection.update', async (update)=>{
    const { connection, lastDisconnect, qr } = update;
    if(qr){ qrCodeData = qr; console.log('QR READY'); }
    if(connection === 'open'){ console.log('BOT READY!'); qrCodeData=''; }
    if(connection === 'close'){
      const shouldReconnect = (lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut;
      if(shouldReconnect) startBot();
    }
  });
  sock.ev.on('messages.upsert', async ({messages})=>{
    const msg = messages[0];
    if(!msg.message || msg.key.fromMe) return;
    const text = msg.message.conversation || msg.message.extendedTextMessage?.text || '';
    if(!text) return;
    const reply = getReply(text);
    await sock.sendMessage(msg.key.remoteJid, { text: reply });
  });
}

app.get('/', (req,res)=>res.send('Bot is Running'));
app.get('/qr', async (req,res)=>{
  if(!qrCodeData) return res.send('<h2>Already Connected - BOT READY!</h2>');
  const qrImg = await QRCode.toDataURL(qrCodeData);
  res.send(`<img src="${qrImg}"><p>Scan with WhatsApp</p>`);
});
app.listen(3000, ()=>{ console.log('Server running'); startBot(); });
