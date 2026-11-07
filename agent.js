const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Agent is Running 24/7!');
});
app.listen(PORT, () => console.log('Server running on port ' + PORT));

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    }
});

client.on('qr', (qr) => {
    console.log('SCAN THIS QR:');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('Smart Agent is Ready!');
});

client.on('message', async (msg) => {
    if (msg.fromMe) return;
    if (msg.from.includes('status')) return;
    let text = msg.body.toLowerCase().trim();
    console.log('Message:', msg.body);
    let reply = '';
    if (text.includes('salam') || text.includes('assalam')) {
        reply = 'Walaikum Assalam! Kya haal hai? Main aapka Agent hoon, online hoon.';
    } else if (text === 'hi' || text === 'hello' || text === 'hey') {
        reply = 'Hello! I am your Agent. I am online. Kya help chahiye?';
    } else if (text.includes('kya haal') || text.includes('kesy ho') || text.includes('how are you')) {
        reply = 'Main bilkul theek hoon, Alhamdulillah! Aap sunao, kya haal hai?';
    } else if (text.includes('where are you') || text.includes('kahan ho')) {
        reply = 'Main yahin hoon, online! Aapka Agent aapki khidmat mein hazir hai.';
    } else if (text.includes('allah hafiz') || text.includes('bye') || text.includes('khuda hafiz')) {
        reply = 'Allah Hafiz! Apna khayal rakhna.';
    } else if (text.includes('kon ho') || text.includes('who are you')) {
        reply = 'Main Rana Ali Haider ka Smart Agent hoon. Aapko kisi cheez mein help chahiye?';
    } else {
        reply = 'Aapka message mil gaya: "' + msg.body + '". Rana Ali Haider abhi busy hain, wo jald reply karein ge. Shukriya!';
    }
    msg.reply(reply);
});

client.initialize();