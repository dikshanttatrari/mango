const { Telegraf } = require("telegraf")
const { message } = require("telegraf/filters")
const dotenv = require("dotenv");
dotenv.config();

const ownerId = Number(process.env.ownerId);
const botToken = process.env.BOT_TOKEN;

const bot = new Telegraf(botToken);

bot.use(async (ctx, next) => {
    if (ctx.from.id === ownerId) {
        // console.log("FOUND the OWNER");
        await next();
    } else {
        ctx.replyWithSticker('CAACAgUAAxkBAAPIaa7Y1pBRvU_dJUUo9-XmlqAO42EAArUeAAIKgHBV0WxjSBsWB7w6BA')
        await ctx.reply(`Hey ${ctx.from.first_name}, I am Mango the Personal agentic ai for @dikshanttatrari. Sorry you are not authorized to use me. Hope you understand.`)
    }
});

bot.start((ctx) => {
    ctx.replyWithSticker('CAACAgUAAxkBAAPIaa7Y1pBRvU_dJUUo9-XmlqAO42EAArUeAAIKgHBV0WxjSBsWB7w6BA')
});



process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

module.exports = bot;