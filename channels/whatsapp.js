const { Client, LocalAuth } = require("whatsapp-web.js");
const qrCode = require("qrcode-terminal")

const client = new Client({
    authStrategy: new LocalAuth({ clientId: "mango" }),
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    }
});

client.once("ready", () => {
    console.log("Whatsapp client is ready.")
})

client.on("qr", (qr) => {
    qrCode.generate(qr, { small: true })
})

client.on("message_create", message => {
    if (message.body === '!ping') {
        console.log("message received")

        client.sendMessage(message.from, "Pong");
    }
})

client.initialize()

module.exports = client