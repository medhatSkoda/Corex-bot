const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('simjoin')
		.setDescription('Replies with Pong!'),
	async execute(interaction) {
		
	},
};