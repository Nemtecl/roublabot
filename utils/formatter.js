const getCommand = (msg, prefix) => {
    const commandBody = msg.content.slice(prefix.length);
    const args = commandBody.split(' ');
    const command = args.shift().toLowerCase();
    return [command, args];
};

const jsonMsg = (data) => {
    return `
        \`\`\`json
        ${JSON.stringify(data)}
        \`\`\`
    `;
};

module.exports = { getCommand, jsonMsg };
