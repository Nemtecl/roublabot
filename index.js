require('dotenv').config();
const Discord = require('discord.js');
const client = new Discord.Client();
const {
    metamob: { krala, missing },
} = require('./commands');
const {
    axios,
    formatter: { getCommand },
} = require('./utils');

const prefix = process.env.PREFIX;

console.log('🤖💣 Invocation du roublabot 💣🤖');

axios.setup();

// TODO : database for server
client.on('message', async (msg) => {
    if (msg.author.bot) return;
    if (!msg.content.startsWith(prefix)) return;
    const [command, args] = getCommand(msg, prefix);
    const { author, channel } = msg;

    try {
        let response = '';
        if (command === 'krala') {
            response = await krala(author);
        } else if (command === 'missing') {
            response = await missing(args, author);
        } else {
            response = { content: '❓ Not implented yet ❓', reply: msg.author };
        }

        channel.send(response);
    } catch (e) {
        msg.reply(e);
    }
});

client.login(process.env.BOT_TOKEN);
