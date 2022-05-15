import axios from 'axios';
import Discord from 'discord.js';
import moment from 'moment';
import { getMetamobPseudo, markdownMsg, archiPrices } from '../utils/index.js';

const server = process.env.SERVER;

const getPseudo = (args, author) => (args.length ? args[0] : getMetamobPseudo(author.id));

const getArchisWithPrices = async (pseudo) => {
  try {
    const archis = await axios.get(`/utilisateurs/${pseudo}/monstres`, {
      params: { quantite: 0, type: 'archimonstre' },
    });

    return archis.map((o) => ({
      ...o,
      price: archiPrices.find((p) => p.name === o.nom).price,
    }));
  } catch (e) {
    throw new Error(`Vous n'avez pas de compte Metamob`);
  }
};

export const krala = async (_args, author) => {
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
  const pseudo = getPseudo(args, author);

  const d = await axios.get(`/utilisateurs/${pseudo}/monstres`, {
    params: { quantite: 0, type: 'archimonstre' },
  });
  const total = d.map((o) => o.nom_normal).length;

  return { content: `Il manque ${total} archi-monstres à ${pseudo}`, reply: author };
};

export const total = async (args, author) => {
  const pseudo = getPseudo(args, author);

  const archis = await getArchisWithPrices(pseudo);
  const total = Intl.NumberFormat('fr-FR').format(
    archis.reduce((acc, cur) => acc + cur.price, 0) * 1000,
  );

  return {
    content: `Le prix total des archis manquants est de ${total} kamas`,
    reply: author,
  };
};

export const prices = async (args, author) => {
  const pseudo = getPseudo(args, author);

  const archis = await getArchisWithPrices(pseudo);

  const embeds = [
    new Discord.MessageEmbed().setTitle('Prix des 50 plus cher archis manquants').setDescription(
      markdownMsg(
        archis
          .sort((a, b) => b.price - a.price)
          .map(
            (o, i) =>
              `${i + 1}. ${o.nom} (${o.souszone}): ${Intl.NumberFormat('fr-FR').format(
                o.price * 1000,
              )} kamas`,
          )
          .slice(0, 50)
          .join('\n'),
      ),
    ),
  ];

  return {
    embeds,
  };
};

export const zones = async (args, author) => {
  const pseudo = getPseudo(args, author);

  let archis = [];
  try {
    archis = await axios.get(`/utilisateurs/${pseudo}/monstres`, {
      params: { quantite: 0, type: 'archimonstre' },
    });
  } catch (e) {
    throw new Error(`Vous n'avez pas de compte Metamob`);
  }

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
  const pseudo = getPseudo(args, author);

  let archis = [];
  try {
    archis = await axios.get(`/utilisateurs/${pseudo}/monstres`, {
      params: { quantite: 0, type: 'archimonstre' },
    });
  } catch (e) {
    throw new Error(`Vous n'avez pas de compte Metamob`);
  }

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

export const steps = async (args, author) => {
  const pseudo = getPseudo(args, author);

  let archis = [];
  try {
    archis = await axios.get(`/utilisateurs/${pseudo}/monstres`, {
      params: { quantite: 0, type: 'archimonstre' },
    });
  } catch (e) {
    throw new Error(`Vous n'avez pas de compte Metamob`);
  }

  const map = new Map();
  archis.forEach(({ etape: step }) => {
    map.set(step, (map.get(step) || 0) + 1);
  });

  const byStep = Array.from(map)
    .sort((a, b) => b[1] - a[1])
    .map(([sz, count], i) => `${i + 1}. Etape ${sz} (${count})`)
    .join('\n');

  const embedStep = new Discord.MessageEmbed()
    .setTitle('Tri par étapes')
    .setDescription(markdownMsg(byStep));

  return {
    embeds: [embedStep],
  };
};

export const has = async (args, author) => {
  if (!args.length) {
    throw new Error(`Usage : ${process.env.PREFIX}has NOM_ARCHI `);
  }

  const name = args.join(' ');
  const pseudo = 'Nemtecl';

  let archis = [];
  try {
    archis = await axios.get(`/utilisateurs/${pseudo}/monstres`, {
      params: { quantite: 0, type: 'archimonstre', nom: name },
    });
  } catch (e) {
    throw new Error(`Vous n'avez pas de compte Metamob`);
  }

  let message = '';

  if (!archis || !archis.length) {
    message = `${name} n'existe pas`;
  } else {
    message = `${pseudo} ${+(archis[0]?.quantite || '0') ? 'a' : "n'a pas"} ${name}`;
  }

  return {
    content: `${message}`,
    reply: author,
  };
};
