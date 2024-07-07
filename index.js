// [PREPARATION]

const fs = require('node:fs');
const path = require('node:path');
// Require the necessary discord.js classes
const { Client, Collection, Intents } = require('discord.js');
// Access your bot info from Secrets (environment variables)
const token = process.env['TOKEN'];
require('./database');  // Import database connection
const express = require('express');
const port = 3000;
const app = express();

// [Hosting!]
app.get('/', (request, response) => {
	return response.send("Rewards is online!");
});
app.listen(port, () => {
	console.log("[EXPRESS] ".magenta + "Express is ready.".brightGreen)
});




const commandsDir = './commands';

// Dummy function to check for errors in a file
const hasErrors = (filePath) => {
	const content = fs.readFileSync(filePath, 'utf-8');
	return content.includes('ERROR'); // Example condition
};

// Read the files in the commands directory
fs.readdir(commandsDir, (err, files) => {
	if (err) {
		console.error('Error reading directory:', err);
		return;
	}

	// Filter out non-JS files
	const jsFiles = files.filter(file => path.extname(file) === '.js');

	// Generate the table
	const table = [];
	table.push('| Filename         | Status |');
	table.push('|------------------|--------|');

	jsFiles.forEach(file => {
		const filePath = path.join(commandsDir, file);
		const status = hasErrors(filePath) ? '❌' : '✅';
		table.push(`| ${file.slice(0, -3).padEnd(16)} | ${status}    |`);
	});

	// Print the table
	console.log(table.join('\n'));
});



// Server function (uncomment if using the bot-server.js file)
// const keepAlive = require('./bot-server'); 

// Create a new client instance
// Add more intents based on your needs
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

// [EVENT HANDLER]

// Read the events files from events folder
const eventsPath = path.join(__dirname, 'events'); //path to events folder based on operating system
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

//dynamically retrieves all the events and registers them
for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
  // the first and second ... are the rest parameter syntax and spread syntax, respectively
}

// [COMMAND HANDLER]
client.commands = new Collection(); // add a new commands property

// Read the command files from commands folder
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	// Set a new item in the Collection
	// With the key as the command name and the value as the exported command module
	client.commands.set(command.data.name, command);
}

// [EXECUTE COMMANDS DYNAMICALLY]

const { Events } = require('discord.js');
const userstats = require('./models/user.js'); // Ensure the correct path to your user model

client.on('interactionCreate', async interaction => {
	try {
		const blockeduser = await userstats.exists({ id: interaction.user.id }); // Correct the query structure
			if (blockeduser === "yes") { // Compare with the string "yes"
			await interaction.reply("You have requested a data removal causing in a server ban within all servers if you run a command. Please remember you can remove the bot block by opening a ticket in our server, although you would need to contact the server to unban you.");
			setTimeout(async () => {
				try {
					await interaction.guild.members.ban(interaction.user.id);
				} catch (banError) {
					console.error('Error banning user:', banError);
					interaction.reply("Error banning you. Data can still be added and collected in this server or any server you share with the bot. We suggest you leave this server to stop data from being collected from this server..")
				}
			}, 5000);
		}
	} catch (error) {
		console.log(error);
	}
});

// 'interactionCreate' even listener
client.on('interactionCreate', async interaction => {
	// Not all interactions are commands, only respond if it's a command
	if (!interaction.isCommand()) return;

	// Get command module from client commands collection
	const command = client.commands.get(interaction.commandName);

	if (!command) return;

	try {
		await command.execute(interaction); // execute command's function
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true }); // ephemeral flag - only the user who executed the command can see it
	}
});





// [FINAL STEPS]
// Keeps discord bot online (uncomment if using the bot-server.js file)
// keepAlive();

// Login to Discord with your client's token
client.login(token);