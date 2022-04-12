export const getCommand = (msg, prefix) => {
  const commandBody = msg.content.slice(prefix.length);
  const args = commandBody.split(' ');
  const command = args.shift().toLowerCase();
  return [command, args];
};

export const jsonMsg = (data) => {
  return `
        \`\`\`json
        ${JSON.stringify(data)}
        \`\`\`
    `;
};

export const markdownMsg = (msg, type = '') => `
\`\`\`${type}
${msg}
\`\`\`
`;
