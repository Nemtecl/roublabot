import axios from 'axios';
import Discord from 'discord.js';
import moment from 'moment';
import { getMetamobPseudo, markdownMsg } from '../utils/index.js';

const server = process.env.SERVER;

export const krala = async (author) => {
  const d = await axios.get(`/kralamoures`);

  if (d.length === 0) {
    return [
      {
        reply: author,
        content: 'Aucun kralamoures prévu pour votre serveur',
      },
    ];
  }

  const { date, url } = d.sort((a, b) => b.date - a.date).shift();

  const attachment = new Discord.MessageAttachment('./assets/krala.png', 'krala.png');
  const embed = new Discord.MessageEmbed()
    .setTitle(`Prochain Kralamoure sur ${server}`)
    .setDescription(`📅  ${moment(date).format('DD/MM/YYYY HH:mm')}`)
    .attachFiles(attachment)
    .setThumbnail('attachment://krala.png')
    .setURL(url);

  return { embeds: [embed] };
};

export const missing = async (args, author) => {
  const pseudo = args.length ? args[0] : getMetamobPseudo(author.id);

  const d = await axios.get(`/utilisateurs/${pseudo}/monstres`, {
    params: { quantite: 0, type: 'archimonstre' },
  });
  const total = d.map((o) => o.nom_normal).length;

  return { content: `Il manque ${total} archi-monstres à ${pseudo}`, reply: author };
};

export const zones = async (args, author) => {
  const pseudo = args.length ? args[0] : getMetamobPseudo(author.id);

  const archis = await axios.get(`/utilisateurs/${pseudo}/monstres`, {
    params: { quantite: 0, type: 'archimonstre' },
  });

  const reduced = archis.reduce((acc, { zone, souszone: subzone }) => {
    const index = acc.findIndex((o) => o.zone === zone);

    if (index === -1) {
      return [
        ...acc,
        {
          zone,
          count: 1,
          subZones: new Map([[subzone, 1]]),
        },
      ];
    }

    const clonedAcc = [...acc];
    const map = clonedAcc[index].subZones;
    map.set(subzone, (map.get(subzone) || 0) + 1);

    clonedAcc[index] = {
      ...clonedAcc[index],
      subZones: map,
      count: clonedAcc[index].count + 1,
    };

    return clonedAcc;
  }, []);

  const byZone = reduced
    .sort((a, b) => b.count - a.count)
    .map((o) => ({
      ...o,
      subZones: Array.from(o.subZones)
        .sort((a, b) => b[1] - a[1])
        .map(([sz, count]) => `${sz} (${count})`),
    }))
    .map(
      ({ zone, count, subZones }, i) =>
        `${i + 1}. ${zone} (${count})
${subZones.map((sz, j) => `\t${j + 1}. ${sz}`).join('\n')}`,
    )
    .join('\n');

  const embedZone = new Discord.MessageEmbed()
    .setTitle(`Tri par zones à fouiller`)
    .setDescription(markdownMsg(byZone, 'css'));

  return {
    embeds: [embedZone],
  };
};

export const subzones = async (args, author) => {
  const pseudo = args.length ? args[0] : getMetamobPseudo(author.id);

  const archis = await axios.get(`/utilisateurs/${pseudo}/monstres`, {
    params: { quantite: 0, type: 'archimonstre' },
  });

  const map = new Map();
  archis.forEach(({ souszone: subzone }) => {
    map.set(subzone, (map.get(subzone) || 0) + 1);
  });

  const bySubZone = Array.from(map)
    .sort((a, b) => b[1] - a[1])
    .map(([sz, count], i) => `${i + 1}. ${sz} (${count})`)
    .join('\n');

  const embedSubZone = new Discord.MessageEmbed()
    .setTitle(`Tri par sous-zones à fouiller`)
    .setDescription(markdownMsg(bySubZone));

  return {
    embeds: [embedSubZone],
  };
};
