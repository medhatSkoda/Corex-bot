//NPM imports
const { Client, Intents } = require('discord.js');
const dotenv = require('dotenv');

//Setup
dotenv.config();

//Create client and intents

const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS, 
    ] 
});

//Important variables
const token = process.env.TOKEN;


client.once('ready', () => {
	console.log('Ready!');
});

// Login to Discord
client.login(token);
