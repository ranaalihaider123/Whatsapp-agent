const { Client, LocalAuth } = require('whatsapp-web.js');
const express = require('express');
const qrcode = require('qrcode');
const app = express();
let lastQR = '';

const client = new Client({ authStrategy: new LocalAuth(), puppeteer: { headless: true, args: ['--no-sandbox','--disable-setuid-sandbox'] } });

app.get('/', (req,res) => res.send('Bot is ON - Go to /qr to scan'));
app.get('/qr', async (req,res) => {
  if(!lastQR) return res.send('QR abhi ready nahi, 30 second baad refresh karo');
  const img = await qrcode.toDataURL(lastQR);
  res.send(`<h1>WhatsApp QR Scan Karo</h1><img src="${img}" style="width:300px"><br><p>WhatsApp > Linked Devices > Link a device > Scan this</p><script>setTimeout(()=>location.reload(),10000)</script>`);
});
app.listen(10000, () => console.log('Server running'));

client.on('qr', qr => { lastQR = qr; console.log('QR READY - Open /qr to scan'); });
client.on('ready', () => console.log('BOT READY!'));
client.on('message', async msg => { if(msg.fromMe) return; await msg.reply('Salam! Main Rana Ali Haider ka Agent hoon. Aapka message mil gaya.'); });
client.initialize();
