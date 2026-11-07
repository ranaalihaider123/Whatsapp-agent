const { Client, LocalAuth } = require('whatsapp-web.js');
const express = require('express');
const qrcode = require('qrcode');
const app = express();
let lastQR = '';
console.log('Starting bot...');

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    args: ['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage','--disable-accelerated-2d-canvas','--no-first-run','--no-zygote','--single-process','--disable-gpu']
  }
});

app.get('/', (req,res) => res.send('Bot is ON - Go to /qr'));
app.get('/qr', async (req,res) => {
  if(!lastQR) return res.send('QR abhi ready nahi, 30 second baad refresh karo. LastQR empty hai.');
  const img = await qrcode.toDataURL(lastQR);
  res.send(`<h1>Scan Karo</h1><img src="${img}" style="width:300px"><script>setTimeout(()=>location.reload(),10000)</script>`);
});
app.listen(10000, () => console.log('Server running'));

client.on('qr', qr => { lastQR = qr; console.log('QR READY - Open /qr to scan'); });
client.on('ready', () => console.log('BOT READY!'));
client.on('auth_failure', m => console.log('AUTH FAIL: ' + m));
client.on('disconnected', r => console.log('DISCONNECTED: ' + r));
client.initialize().then(()=>console.log('Initialize done')).catch(e=>console.log('INIT ERROR: '+e.message));
