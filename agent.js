const { Client, LocalAuth } = require('whatsapp-web.js');
const express = require('express');
const app = express();
const client = new Client({ authStrategy: new LocalAuth(), puppeteer: { headless: true, args: ['--no-sandbox','--disable-setuid-sandbox'] } });

app.get('/', (req,res) => res.send('Bot is ON'));
app.listen(10000, () => console.log('Server running'));

client.on('ready', () => console.log('BOT READY!'));
client.on('message', async msg => { if(msg.fromMe) return; await msg.reply('Salam! Main Rana Ali Haider ka Agent hoon. Aapka message mil gaya.'); });

client.initialize();

setTimeout(async () => {
  try {
    const code = await client.requestPairingCode('923027029179');
    console.log('PAIRING CODE: ' + code);
  } catch(e){ console.log('Pairing error: ' + e.message); }
}, 8000);
