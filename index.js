import { config } from 'dotenv';
import Discord from 'discord.js';
import { axiosSetup, getCommand } from './utils/index.js';
import { krala, missing, zones, subzones, steps, has, prices, total } from './commands/index.js';

config();
axiosSetup();

const client = new Discord.Client({ intents: ['GUILDS', 'GUILD_MESSAGES'] });

const prefix = process.env.PREFIX;

console.log('🤖💣 Invocation du roublabot 💣🤖');

const commands = [
  { command: 'krala', fn: krala },
  { command: 'has', fn: has },
  { command: 'total', fn: total },
  { command: 'prices', fn: prices },
  { command: 'missing', fn: missing },
  { command: 'zones', fn: zones },
  { command: 'subzones', fn: subzones },
  { command: 'step', fn: steps },
];

client.on('messageCreate', async (msg) => {
  if (msg.author.bot) return;
  if (!msg.content.startsWith(prefix)) return;
  const [command, args] = getCommand(msg, prefix);
  const { author, channel } = msg;

  try {
    let response = '';
    const commandFn = commands.find((c) => c.command === command);
    if (commandFn) {
      response = await commandFn.fn(args, author);
    } else {
      response = { content: '❓ Not implented yet ❓', reply: msg.author };
    }
    channel.send(response);
  } catch (e) {
    msg.reply({ content: e.message, reply: msg.author });
  }
});

client.login(process.env.BOT_TOKEN);
