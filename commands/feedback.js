const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('feedback')
		.setDescription('Send feedback to the server'),
	async execute(interaction) {
	},
};