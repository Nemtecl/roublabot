const axios = require('axios');
const Discord = require('discord.js');
const moment = require('moment');
const {
    formatter: { jsonMsg },
} = require('../utils');
const server = process.env.SERVER;

const krala = async (author) => {
    const d = await axios.get(`/kralamoures`);

    if (d.length === 0) {
        return {
            reply: author,
            content: 'Aucun kralamoures prévu pour votre serveur',
        };
    }

    const { date, url } = d.sort((a, b) => b.date - a.date).shift();
    
    const attachment = new Discord.MessageAttachment('./assets/krala.png', 'krala.png')
    const embed = new Discord.MessageEmbed()
        .setTitle(`Prochain Kralamoure sur ${server}`)
        .setDescription(`📅  ${moment(date).format('DD/MM/YYYY HH:mm')}`)
        .attachFiles(attachment)
        .setThumbnail('attachment://krala.png')
        .setURL(url);

    return { embed };
};


const missing = async (args, author) => {
    if (args.length !== 1) {
        throw 'utilisation: !missing PSEUDO';
    }

    const d = await axios.get(`/utilisateurs/${args[0]}/monstres?recherche=1`);
    const total = d.map(o => o.nom_normal).length; 

    return { content: `Il manque ${total} archi-monstres à ${args[0]}`, reply: author }
};

module.exports = { krala, missing };
