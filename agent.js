const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const express = require('express');
const qrcode = require('qrcode');
const pino = require('pino');

const app = express();
let lastQR = '';
let sock = null;
const userMemory = {};

app.get('/', (req, res) => res.send('Bot ON - Rana Ali Haider ULTIMATE AI'));
app.get('/qr', async (req, res) => {
  if (!lastQR) return res.send('Bot is Connected - No QR needed');
  const img = await qrcode.toDataURL(lastQR);
  res.send(`<h1>Scan QR</h1><img src="${img}" style="width:300px"><script>setTimeout(()=>location.reload(),8000)</script>`);
});
app.listen(10000, () => console.log('Server running'));

const JOKES = [
  "Why did the scarecrow win an award? Because he was outstanding in his field!",
  "Why do scientists not trust atoms? Because they make up everything!",
  "What do you call a fish without eyes? A fsh!",
  "Why did the math book look sad? Because it had too many problems!",
  "Why did the coffee file a police report? It got mugged!",
  "What do you call a lazy kangaroo? A pouch potato!",
  "Why did the bicycle fall over? It was two-tired!",
  "How does a penguin build its house? Igloos it together!"
];
const QUOTES = [
  "Success is not final, failure is not fatal: It is the courage to continue that counts. - Winston Churchill",
  "The best time to plant a tree was 20 years ago. The second best time is now.",
  "Do not watch the clock, do what it does. Keep going. - Sam Levenson",
  "Your future is created by what you do today, not tomorrow.",
  "Hard work beats talent when talent does not work hard.",
  "A year from now you may wish you had started today. - Karen Lamb",
  "Dream big, start small, act now.",
  "Discipline is the bridge between goals and accomplishment. - Jim Rohn"
];
const FACTS = [
  "Did you know? Your brain uses about 20 percent of your body total energy, even though it is only 2 percent of your weight!",
  "Did you know? Pakistan is home to the world second highest mountain, K2 (8611m)!",
  "Did you know? Honey never spoils. Archaeologists found 3000-year-old honey in Egypt that was still edible!",
  "Did you know? The Moon is moving away from Earth about 3.8 cm every year!",
  "Did you know? Your body is about 60 percent water!",
  "Did you know? A bolt of lightning is 5 times hotter than the surface of the Sun!",
  "Did you know? Lahore was once called the City of Gardens because of its beautiful Mughal gardens!"
];
const MOTIVATION = [
  "Do not give up! Every successful person was once a beginner who refused to quit. You are closer than you think. Keep going!",
  "Remember: Tough times do not last, tough people do. You have survived 100 percent of your worst days. You can handle this too!",
  "Today is a new day, a new chance. Forget yesterday failure. Focus on today win. One small step today = Big success tomorrow!",
  "You do not have to be great to start, but you have to start to be great. Start now, even if it is small!",
  "Discipline is more important than Motivation. Motivation gets you started, but discipline keeps you going."
];
const HEALTH_TIPS = [
  "Health Tip: Drink 8 glasses of water daily. Your skin, brain, and energy will thank you!",
  "Health Tip: Walk 30 minutes daily. It reduces stress, improves heart health, and clears your mind!",
  "Health Tip: Sleep 7 to 8 hours. Your brain fixes itself while you sleep. Avoid mobile 1 hour before sleeping!",
  "Health Tip: Eat one fruit daily, avoid sugary drinks. Small changes = Big results in 30 days!",
  "Health Tip: Take 5 deep breaths when stressed. It instantly calms your nervous system!"
];
const BUSINESS_IDEAS = [
  "Business Ideas for Pakistan (Low Investment):\n\n1. Online Reselling (Daraz / Facebook) - Start with Rs 10000\n2. Home-made Food Delivery in Lahore\n3. Digital Marketing Agency for Local Shops\n4. YouTube / TikTok - Teach a skill\n5. Import Mobile Accessories from China\n\nWhich one do you want full plan for? Tell me number 1 to 5!",
  "Top 5 Business Ideas 2026:\n\n1. AI Services - Help businesses use AI\n2. E-commerce - Sell on Shopify / Daraz\n3. Tuition / Online Courses\n4. Real Estate - Property dealing in Lahore\n5. Solar Panel Installation - High demand!\n\nTell me which one you like, I will give you full step-by-step plan!"
];

function random(arr){ return arr[Math.floor(Math.random()*arr.length)]; }

async function getAIReply(userMsg, userId) {
  const msg = userMsg.toLowerCase().trim();
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-PK', { timeZone: 'Asia/Karachi', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-PK', { timeZone: 'Asia/Karachi', hour: '2-digit', minute: '2-digit' });
  const dayStr = now.toLocaleDateString('en-PK', { timeZone: 'Asia/Karachi', weekday: 'long' });

  if (!userMemory[userId]) userMemory[userId] = [];
  userMemory[userId].push(userMsg);
  if (userMemory[userId].length > 8) userMemory[userId].shift();
  const history = userMemory[userId].join(' | ');

  if (msg === 'menu' || msg === '/menu' || msg === 'help' || msg === '/help' || msg === 'options' || msg === 'what can you do') {
    return `RANA ALI HAIDER AI - MAIN MENU\n\nINFO:\n- Type date - Today date\n- Type time - Current time\n- Type day - Which day today\n\nFUN:\n- Type joke - Funny joke\n- Type quote - Motivational quote\n- Type fact - Amazing fact\n- Type motivation - Motivation\n- Type shayari - Urdu Shayari\n\nBUSINESS:\n- Type business idea - Business ideas\n- Type price - Price info\n- Type order - Place order\n\nLEARNING:\n- Type study tip - Study tips\n- Ask any question like What is AI?\n\nISLAMIC:\n- Type islamic - Islamic quote\n- Type dua - Dua\n\nSPORTS:\n- Type cricket - Cricket info\n- Type weather - Weather info\n\nHEALTH:\n- Type health tip\n\nJust type any word above! Or ask me ANYTHING in English!`;
  }

  if (['hi','hello','hey','salam','aoa','assalam o alaikum','hy','hii','hola'].includes(msg)) {
    return random([
      `Hello! I am Rana Ali Haider AI Assistant. How are you? Type menu to see what I can do!`,
      `Hi there! How is your day going? I can tell jokes, give business ideas, answer any question. Type menu`,
      `Hey! Nice to see you. What should we talk about today? Jokes, Business, Study, or anything? Type menu for options.`
    ]);
  }
  if (msg.includes('good morning')) return `Good Morning! Have a great day! Today is ${dayStr}, ${dateStr}. Start your day with Bismillah and one goal. What is your goal today?`;
  if (msg.includes('good night')) return `Good Night! Allah Hafiz. Sleep well, tomorrow is a new chance. Sweet dreams!`;
  if (msg.includes('good evening')) return `Good Evening! How was your day? Hope it was productive. How can I help you this evening?`;
  if (msg.includes('how are you') || msg.includes('kese ho') || msg.includes('how r u')) {
    return random([
      `I am doing great, Alhamdulillah! Thanks for asking. How are you? Tell me, what is new in your life?`,
      `I am perfect! As an AI, I never get tired! How about you? How is your day going?`,
      `I am fantastic! Ready to help you with anything. What about you? How are you feeling today?`
    ]);
  }

  if (msg.includes('date') || msg.includes('today') || msg.includes('tarikh')) return `Today Date: ${dateStr}\nDay: ${dayStr}\nTime: ${timeStr} Pakistan Time.\n\nWhat is your plan for today?`;
  if (msg.includes('day') && msg.length < 20) return `Today is ${dayStr}! \nDate: ${dateStr}\n\nEnjoy your ${dayStr}!`;
  if (msg.includes('time') || msg.includes('waqt')) return `Current Time in Pakistan: ${timeStr}\nDate: ${dateStr}\n\nTime is precious! Use it wisely.`;
  if (msg.includes('who are you') || msg.includes('your name') || msg.includes('tum kon')) {
    return `My name is AI Assistant, and I work for Rana Ali Haider.\n\nI am a smart AI like ChatGPT. I can answer anything, tell jokes, give business ideas, help in study, and much more.\n\nType menu to see everything I can do!`;
  }

  if (msg.includes('joke') || msg.includes('funny')) return random(JOKES) + `\n\nWant another one? Just type joke again!`;
  if (msg.includes('quote') || msg.includes('quotation')) return random(QUOTES) + `\n\nType quote for more inspiration!`;
  if (msg.includes('fact') || msg.includes('amazing')) return random(FACTS) + `\n\nType fact for another amazing fact!`;
  if (msg.includes('motivat')) return random(MOTIVATION);
  if (msg.includes('health') || msg.includes('fitness')) return random(HEALTH_TIPS);
  if (msg.includes('shayari') || msg.includes('poetry') || msg.includes('sher')) {
    return random([
      "Shayari:\n\nMohabbat me nahi hai farq jeene aur marne ka,\nUsi ko dekh kar jeete hain, jis kafir pe dum nikle!",
      "Shayari:\n\nKoshish bhi kar, umeed bhi rakh, rasta bhi chun,\nPhir iske baad thoda mukaddar talaash kar!",
      "Shayari:\n\nZindagi me sada muskurate raho,\nDukh kitna bhi ho, dil se dua karte raho!"
    ]);
  }
  if (msg.includes('islamic') || msg.includes('hadith') || msg.includes('quran')) {
    return random([
      "Islamic Quote:\n\nThe best among you are those who learn the Quran and teach it. - Bukhari",
      "Islamic Quote:\n\nAllah does not burden a soul beyond that it can bear. - Quran 2:286\n\nStay strong, Allah is with you!",
      "Islamic Quote:\n\nAnd your Lord says: Call upon Me, I will respond to you. - Quran 40:60\n\nNever lose hope in Allah mercy."
    ]);
  }
  if (msg.includes('dua') || msg.includes('pray')) return `Dua for you:\n\nMay Allah bless you with success, health, and happiness. Ameen!`;
  if (msg.includes('business') || msg.includes('earn money') || msg.includes('startup')) return random(BUSINESS_IDEAS);
  if (msg.includes('price') || msg.includes('rate') || msg.includes('cost') || msg.includes('how much')) return `For price, please tell me:\n1. Which item do you need?\n2. How much quantity?\n3. Your city?\n\nRana Ali Haider will give you the best rate. Please send your details.`;
  if (msg.includes('order') || msg.includes('buy') || msg.includes('book')) return `Great! You want to place an order!\n\nPlease send me:\n1. Your Full Name\n2. Your City\n3. What do you want to buy?\n4. How many pieces?\n\nI will note it and Rana Ali Haider will contact you soon.`;
  if (msg.includes('timing') || msg.includes('open') || msg.includes('close')) return `We are available from 10 AM to 10 PM.\n\nIf you want to talk now, send your name and work, Rana Ali Haider will reply soon.`;
  if (msg.includes('location') || msg.includes('where') || msg.includes('address')) return `We are in Lahore, Punjab.\n\nWhere are you from? Tell me your city for delivery info.`;
  if (msg.includes('contact') || msg.includes('number') || msg.includes('call')) return `You can contact Rana Ali Haider directly on this WhatsApp number.\n\nJust send your message here, I am his AI assistant and I will make sure he sees it.`;
  if (msg.includes('study') || msg.includes('exam') || msg.includes('padhai')) return `Study Tips for Success:\n\n1. Study 25 min, break 5 min (Pomodoro)\n2. Write, do not just read - writing = 2x memory\n3. Teach someone what you learned\n4. Sleep well before exam\n5. Avoid mobile while studying\n\nWhich subject are you studying? I can help you with any topic!`;
  if (msg.includes('cricket') || msg.includes('psl') || msg.includes('babar')) return `Cricket Update:\n\nPakistan Cricket is always exciting! Babar Azam, Shaheen Afridi, and Rizwan are our stars.\n\nDo you want to know:\n- Latest score?\n- PSL schedule?\n- Player stats?\n\nAsk me anything about cricket!`;
  if (msg.includes('weather') || msg.includes('mausam')) return `Weather in Lahore:\n\nToday is ${dateStr}. Lahore weather is usually pleasant in November. For exact live weather, please check your weather app.`;
  if (msg.includes('thank') || msg.includes('shukria')) return `You are most welcome! Happy to help. Message me anytime, I am here 24/7. Take care!`;
  if (msg.includes('bye') || msg.includes('allah hafiz') || msg.includes('goodbye')) return `Allah Hafiz! Take care. Remember me in your prayers. Message me anytime you need help!`;
  if (msg === 'ok' || msg === 'okay' || msg === 'acha') return `Great! So what next? Type menu to see all options, or ask me anything!`;
  if (msg.includes('ali haider') || msg.includes('rana')) return `Rana Ali Haider is the owner of this business. He is a very helpful and honest person.\n\nIf you want to talk to him directly, send your name and message, I will forward it to him.`;

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `You are Rana Ali Haider ULTIMATE AI assistant on WhatsApp, like ChatGPT. Always reply in ENGLISH only. Today: ${dateStr}, Time: ${timeStr} Pakistan. Past chat: ${history} Rules: Answer ANYTHING in detail: History, Science, Business, Maths, Coding, Health, Islam, Pakistan, World, Jokes, Stories, Advice, Motivation, Sports, Technology. Give DETAILED, DIVERSE answers with examples, bullet points. Never repeat same sentence. Be friendly, funny, helpful like a smart best friend. If user asks price, say Rana Ali will confirm but keep talking and ask name and city. User said: ${userMsg}` }] }]
      })
    });
    const data = await res.json();
    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (aiText) return aiText;
    return `Sorry, AI is busy. Ask again, I will explain in detail! Your question: ${userMsg}`;
  } catch (e) { return `Sorry, small issue. Please message again, I will answer in full detail.`; }
}

async function start() {
  const { state, saveCreds } = await useMultiFileAuthState('auth');
  sock = makeWASocket({ auth: state, logger: pino({ level: 'silent' }) });
  sock.ev.on('creds.update', saveCreds);
  sock.ev.on('connection.update', (u) => {
    if (u.qr) { lastQR = u.qr; console.log('QR READY'); }
    if (u.connection === 'open') { console.log('BOT READY!'); lastQR = ''; }
    if (u.connection === 'close') { console.log('Disconnected - Retrying'); start(); }
  });
  sock.ev.on('messages.upsert', async ({ messages }) => {
    const m = messages[0];
    if (!m.message || m.key.fromMe) return;
    const text = m.message.conversation || m.message.extendedTextMessage?.text || m.message.imageMessage?.caption || '';
    if (!text) return;
    const userId = m.key.remoteJid;
    console.log('MSG:', text);
    try {
      await sock.sendPresenceUpdate('composing', userId);
      const reply = await getAIReply(text, userId);
      await sock.sendMessage(userId, { text: reply });
    } catch (e) { console.log('Send Error', e.message); }
  });
}
start();
