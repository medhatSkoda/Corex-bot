//NPM imports
const discordModals = require('discord-modals')
const { Modal, TextInputComponent, showModal } = require('discord-modals')
const fs = require('node:fs');
const { Client, Intents, Collection, MessageEmbed, DiscordAPIError, Formatters } = require('discord.js');
const dotenv = require('dotenv');

//Setup
dotenv.config();

//Create client and intents

const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS, 
    ] 
});
discordModals(client);
client.commands = new Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.data.name, command);
}

//Important variables
const token = process.env.TOKEN;


client.once('ready', () => {
	console.log('Ready!');
});

//Error embed

const errorEmbed = new MessageEmbed()
	.setColor('#705cf4')
	.setAuthor({ name: `Looks like something went wrong!` })
	.setDescription('Hey there! Unfortunately, an internal error has occurred inside the bot, so this command is currently unavailable. Please try again later.')
	.addField('Error:', '```\nUndefined error\n```');


const modal = new Modal() 
	.setCustomId('feedback-modal')
	.setTitle('Give feedback to Project Corex')
	.addComponents(
	  new TextInputComponent() 
	  .setCustomId('feedback-textinput')
	  .setLabel('Feedback')
	  .setStyle('LONG') 
	  .setMinLength(5)
	  .setMaxLength(500)
	  .setPlaceholder('Your feedback here...')
	  .setRequired(true),
	  new TextInputComponent()
	  .setCustomId('questions-textinput')
	  .setLabel('Any questions?')
	  .setStyle('LONG')
	  .setMinLength(5)
	  .setMaxLength(500)
	  .setPlaceholder('Your questions here...')
	  .setRequired(false)
	);

client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

	const command = client.commands.get(interaction.commandName);

	if (!command) return;

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
	}
	
	console.log(`${interaction.user.tag} in #${interaction.channel.name} triggered an interaction.`);

	if(interaction.commandName === 'feedback') {
		showModal(modal, {
		  client: client, 
		  interaction: interaction 
		})
	}
});

client.on('modalSubmit', async (modal) => {
	if(modal.customId === 'feedback-modal'){
	  const firstResponse = modal.getTextInputValue('feedback-textinput');
	  const secondResponse = modal.getTextInputValue('questions-textinput');
	  const feedbackEmbed = new MessageEmbed()
		.setColor('#705cf4')
		.setAuthor({ name: `Feedback from ${modal.user.username}`, iconURL: modal.user.avatarURL() })
		.setDescription(`${firstResponse}\n**Questions?**\n${secondResponse}`)
		.setTimestamp();

	  await modal.deferReply({ ephemeral: true })
	  modal.followUp({ content: 'Your application is ready to be reviewed' + Formatters.codeBlock('markdown', firstResponse, secondResponse), ephemeral: true }).then(() => {
		client.channels.cache.get('975028730827251762').send({ embeds: [feedbackEmbed] });
	  });
	  
	  
	}  
});
// Login to Discord
client.login(token);
