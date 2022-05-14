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
		Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
		Intents.FLAGS.GUILD_MESSAGES,
		Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
		Intents.FLAGS.GUILD_MEMBERS,
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

//Feedback modal
const feedbackModal = new Modal() 
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

//Suggestion modal
const suggestionModal = new Modal()
	.setCustomId('suggestion-modal')
	.setTitle('Make a suggestion for Project Corex')
	.addComponents(
		new TextInputComponent()
		.setCustomId('suggestion-textinput')
		.setLabel('Suggestion')
		.setStyle('LONG')
		.setMinLength(5)
		.setMaxLength(500)
		.setPlaceholder('Your suggestion here...')
		.setRequired(true),
	);

client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

	const command = client.commands.get(interaction.commandName);

	if (!command) return;

	//Check for any errors
	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
	}
	
	//Feedback and suggestion modals
	if(interaction.commandName === 'feedback') {
		showModal(feedbackModal, {
		  client: client, 
		  interaction: interaction 
		})
	}

	if(interaction.commandName === 'suggestion') {
		showModal(suggestionModal, {
		  client: client, 
		  interaction: interaction 
		})
	}


	//Info commands
	if (interaction.options.getSubcommand() === 'user') {
		const user = interaction.options.getUser('user');
		const guild = client.guilds.cache.get(process.env.GUILD_ID);
		const member = await guild.members.fetch(user);
		if (user) {
			const userInfoEmbed = new MessageEmbed()
				.setColor('#705cf4')
				.setAuthor({ name: `${user.tag}`, iconURL: user.displayAvatarURL() })
				.setThumbnail(user.displayAvatarURL())
				.setDescription(`<@${user.id}>`)
				.addFields(
					{ name: 'Created at:', value: `<t:${Math.round(user.createdTimestamp / 1000)}>`, inline: true },
					{ name: 'Joined at:', value: `<t:${Math.round(member.joinedAt / 1000)}>`, inline: true },
				)
			await interaction.reply({ embeds: [userInfoEmbed], ephemeral: true });
		} else {
			
			await interaction.reply(`Your username: ${interaction.user.username}\nYour ID: ${interaction.user.id}`);
		}
	} else if (interaction.options.getSubcommand() === 'server') {
		await interaction.reply(`Server name: ${interaction.guild.name}\nTotal members: ${interaction.guild.memberCount}`);
	}
});


//Send suggestion and feedback modals
client.on('modalSubmit', async (modal) => {
	if(modal.customId === 'feedback-modal'){
	  const firstResponse = modal.getTextInputValue('feedback-textinput');
	  const secondResponse = modal.getTextInputValue('questions-textinput');
	  const feedbackEmbed = new MessageEmbed()
		.setColor('#705cf4')
		.setAuthor({ name: `Feedback from ${modal.user.username}`, iconURL: modal.user.avatarURL() })
		.setDescription(`> ${firstResponse}\n**Questions?**\n> ${secondResponse}`)
		.setTimestamp();

	  await modal.deferReply({ ephemeral: true })
	  modal.followUp({ content: 'Your feedback is ready to be reviewed' + Formatters.codeBlock('markdown', firstResponse, secondResponse), ephemeral: true }).then(() => {
		client.channels.cache.get('975042999920783390').send({ embeds: [feedbackEmbed] });
	  });
	}  

	//Suggestion modal
	if(modal.customId === 'suggestion-modal'){
		const suggestion = modal.getTextInputValue('suggestion-textinput');
		const suggestionEmbed = new MessageEmbed()
			.setColor('#705cf4')
			.setAuthor({ name: `Suggestion from ${modal.user.username}`, iconURL: modal.user.avatarURL() })
			.setDescription(`> ${suggestion}`)
			.setTimestamp();
		await modal.deferReply({ ephemeral: true })
		modal.followUp({ content: 'Your suggestion is ready to be reviewed' + Formatters.codeBlock('markdown', suggestion), ephemeral: true }).then(() => {
			client.channels.cache.get('975028730827251762').send({ embeds: [suggestionEmbed] });
		});
	}	
});

client.on('messageCreate', async message => {
	if (message.channelId === '975028730827251762'){
		message.react('👍');
		message.react('👎');
	}
});

//Random welcoming message
client.on('guildMemberAdd', member => {
	const welcomingMessages = [
		`<@${member.user.id}> just slid into the server. <a:aniblobcool:975095747890532412>`,
		`A <@${member.user.id}> has spawned in the server. <a:blobcathug:975096179736059954>`,
		`Swoooosh. <@${member.user.id}> just landed.`
		`We've been expecting you <@${member.user.id}>. <a:aniblobcool:975095747890532412>`,
		`<@${member.user.id}> just joined the server. <a:blob_dance:975096214917890088>`,
	];
	const random = welcomingMessages[Math.floor(Math.random() * welcomingMessages.length)];
	client.channels.cache.get('935550475317682241').send(random);
})

// Login to Discord
client.login(token);
