//NPM imports
const fs = require('node:fs');
const { Client, Intents, Collection } = require('discord.js');
const dotenv = require('dotenv');

//Setup
dotenv.config();

//Create client and intents

const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS, 
    ] 
});

client.commands = new Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	// Set a new item in the Collection
	// With the key as the command name and the value as the exported module
	client.commands.set(command.data.name, command);
}

//Important variables
const token = process.env.TOKEN;


client.once('ready', () => {
	console.log('Ready!');
});

client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

	const command = client.commands.get(interaction.commandName);

	if (!command) return;

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
	
	console.log(`${interaction.user.tag} in #${interaction.channel.name} triggered an interaction.`);
});
// Login to Discord
client.login(token);
