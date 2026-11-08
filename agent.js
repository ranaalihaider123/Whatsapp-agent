const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const pino = require('pino');
const qrcode = require('qrcode-terminal');

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

    // If not registered, ask for Pairing Code
    if (!sock.authState.creds.registered) {
        const phoneNumber = process.env.PHONE_NUMBER || '923027029179';
        console.log('Requesting pairing code for:', phoneNumber);
        setTimeout(async () => {
            try {
                const code = await sock.requestPairingCode(phoneNumber);
                console.log('====================================');
                console.log('YOUR PAIRING CODE IS: ' + code);
                console.log('Go to WhatsApp > Linked Devices > Link with phone number');
                console.log('Enter this code: ' + code);
                console.log('====================================');
            } catch (e) {
                console.log('Pairing code error:', e.message);
            }
        }, 3000);
    }

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('Connection closed, reconnecting:', shouldReconnect);
            if (shouldReconnect) startBot();
        } else if (connection === 'open') {
            console.log('✅ Connected to WhatsApp! Bot is LIVE');
        }
    });

    sock.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message || msg.key.fromMe) return;
        const text = msg.message.conversation || msg.message.extendedTextMessage?.text || '';
        const from = msg.key.remoteJid;
        console.log('Message from', from, ':', text);
        if (text.toLowerCase() === 'hi' || text.toLowerCase() === 'hello') {
            await sock.sendMessage(from, { text: 'Hello! Bot is working ✅' });
        }
    });
}

startBot();
