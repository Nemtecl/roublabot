import { config } from 'dotenv';
import Discord from 'discord.js';
import { axiosSetup, getCommand } from './utils/index.js';
import { krala, missing, zones, subzones } from './commands/index.js';

config();
axiosSetup();

const client = new Discord.Client({ intents: ['GUILDS', 'GUILD_MESSAGES'] });

const prefix = process.env.PREFIX;

console.log('🤖💣 Invocation du roublabot 💣🤖');

client.on('messageCreate', async (msg) => {
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
    } else if (command === 'zones') {
      response = await zones(args, author);
    } else if (command === 'subzones') {
      response = await subzones(args, author);
    } else {
      response = { content: '❓ Not implented yet ❓', reply: msg.author };
    }
    channel.send(response);
  } catch (e) {
    msg.reply(e);
  }
});

client.login(process.env.BOT_TOKEN);
