const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('suggestion')
		.setDescription('Make a suggestion for Project Corex'),
	async execute(interaction) {
	},
};