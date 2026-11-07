const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 10000;

app.get('/', (req, res) => {
  res.send('WhatsApp Agent is running. Check Render Logs for QR code.');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

console.log('Starting WhatsApp client...');

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu'
    ]
  }
});

client.on('qr', (qr) => {
  console.log('QR_RECEIVED - Scan this QR code:');
  qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
  console.log('WhatsApp Client is READY!');
});

client.on('auth_failure', (msg) => {
  console.log('AUTH_FAILURE:', msg);
});

client.on('disconnected', (reason) => {
  console.log('DISCONNECTED:', reason);
});

client.initialize();
