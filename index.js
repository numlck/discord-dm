const Discord = require('discord.js');
const chalk = require('chalk');
const fs = require('fs');

const config = require('./config.json');
const Bot = require('./bot.js');


const client = new Discord.Client();
const tokens = fs.readFileSync('tokens.txt', 'utf-8').replace(/\r/gi, '').split('\n');
const readline = require('readline');


new Bot(client, tokens[0], "<discord name>", `
	<message>
`).send();
