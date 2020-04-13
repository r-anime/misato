const path = require('path');
const {Client} = require('yuuko');
const log = require('another-logger');
const config = require('../config');

const bot = new Client({
	token: config.discord.token,
	prefix: config.discord.prefix,
});

bot.addCommandDir(path.join(__dirname, 'commands'));

bot.on('ready', () => {
	log.success(`Connected to Discord as ${bot.user.username}#${bot.user.discriminator}`);
});

bot.connect();
