const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
app.get('/', (req, res) => res.send('Bot is LIVE ✅'));
app.listen(PORT, () => console.log('Web server running on port ' + PORT));

const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const pino = require('pino');

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info');
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: true,
        auth: state,
        browser: ['Render Bot', 'Chrome', '1.0'],
    });

    // If not registered, ask for pairing code
    if (!sock.authState.creds.registered) {
        const phoneNumber = '923027029179';
        setTimeout(async () => {
            try {
                const code = await sock.requestPairingCode(phoneNumber);
                console.log('====================================');
                console.log('YOUR PAIRING CODE IS: ' + code);
                console.log('====================================');
            } catch (e) {
                console.log('Pairing code error:', e.message);
            }
        }, 8000);
    }

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        const { connection } = update;
        if (connection === 'close') {
            console.log('Connection closed, reconnecting...');
            setTimeout(() => startBot(), 3000);
        } else if (connection === 'open') {
            console.log('✅ Connected to WhatsApp! Bot is LIVE');
        }
    });

    sock.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message || msg.key.fromMe) return;
        const text = msg.message.conversation || msg.message.extendedTextMessage?.text || '';
        const from = msg.key.remoteJid;
        if (text.toLowerCase() === 'hi' || text.toLowerCase() === 'hello') {
            await sock.sendMessage(from, { text: 'Hello! Bot is working ✅' });
        }
    });
}

startBot();
