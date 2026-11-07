const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const express = require('express');
const qrcode = require('qrcode');
const pino = require('pino');

const app = express();
let lastQR = '';
let sock = null;
const userMemory = {};
const userName = {};

app.get('/', (req, res) => res.send('Bot ON - Rana Ali Haider ULTIMATE AI'));
app.get('/qr', async (req, res) => {
  if (!lastQR) return res.send('Bot is Connected - No QR needed');
  const img = await qrcode.toDataURL(lastQR);
  res.send(`<h1>Scan QR</h1><img src="${img}" style="width:300px"><script>setTimeout(()=>location.reload(),8000)</script>`);
});
app.listen(10000, () => console.log('Server running'));

// ============ DATA BANKS - FOR DIVERSITY ============
const JOKES = [
  "Why did the scarecrow win an award? Because he was outstanding in his field! 😂",
  "Why don't scientists trust atoms? Because they make up everything! 🤣",
  "What do you call a fish without eyes? A fsh! 🐟😂",
  "Why did the math book look sad? Because it had too many problems! 📚😂",
  "Why did the coffee file a police report? It got mugged! ☕😂",
  "What do you call a lazy kangaroo? A pouch potato! 🦘😂",
  "Why did the smartphone go to therapy? It had too many unresolved notifications! 📱😂",
  "What did one wall say to the other wall? I'll meet you at the corner! 🧱😂",
  "Why did the bicycle fall over? It was two-tired! 🚲😂",
  "How does a penguin build its house? Igloos it together! 🐧😂"
];
const QUOTES = [
  "✨ 'Success is not final, failure is not fatal: It is the courage to continue that counts.' - Winston Churchill",
  "✨ 'The best time to plant a tree was 20 years ago. The second best time is now.' - Chinese Proverb",
  "✨ 'Don't watch the clock; do what it does. Keep going.' - Sam Levenson",
  "✨ 'Your future is created by what you do today, not tomorrow.'",
  "✨ 'Hard work beats talent when talent doesn't work hard.'",
  "✨ 'A year from now you may wish you had started today.' - Karen Lamb",
  "✨ 'Dream big, start small, act now.'",
  "✨ 'Discipline is the bridge between goals and accomplishment.' - Jim Rohn"
];
const FACTS = [
  "🧠 Did you know? Your brain uses about 20% of your body's total energy, even though it's only 2% of your weight!",
  "🌍 Did you know? Pakistan is home to the world's second highest mountain, K2 (8,611m)!",
  "🐝 Did you know? Honey never spoils. Archaeologists found 3000-year-old honey in Egypt that was still edible!",
  "🌙 Did you know? The Moon is moving away from Earth about 3.8 cm every year!",
  "💧 Did you know? Your body is about 60% water!",
  "🐘 Did you know? Elephants are one of the few animals that can recognize themselves in a mirror!",
  "⚡ Did you know? A bolt of lightning is 5 times hotter than the surface of the Sun!",
  "📚 Did you know? Lahore was once called the 'City of Gardens' because of its beautiful Mughal gardens!"
];
const MOTIVATION = [
  "🔥 Don't give up! Every successful person was once a beginner who refused to quit. You are closer than you think. Keep going!",
  "💪 Remember: Tough times don't last, tough people do. You have survived 100% of your worst days. You can handle this too!",
  "🌟 Today is a new day, a new chance. Forget yesterday's failure. Focus on today's win. One small step today = Big success tomorrow!",
  "🚀 You don't have to be great to start, but you have to start to be great. Start now, even if it's small!",
  "🎯 Discipline > Motivation. Motivation gets you started, but discipline keeps you going. Do it even when you don't feel like it!"
];
const HEALTH_TIPS = [
  "🥗 Health Tip: Drink 8 glasses of water daily. Your skin, brain, and energy will thank you!",
  "🏃 Health Tip: Walk 30 minutes daily. It reduces stress, improves heart health, and clears your mind!",
  "😴 Health Tip: Sleep 7-8 hours. Your brain fixes itself while you sleep. Don't use mobile 1 hour before sleeping
