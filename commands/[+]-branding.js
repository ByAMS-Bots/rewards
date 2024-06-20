// Example of slash command options and reading option input
const { SlashCommandBuilder } = require('@discordjs/builders');
const Server = require("../models/server-settings")
const { Permissions } = require('discord.js');
module.exports = {
  data: new SlashCommandBuilder()
    .setName('p-branding')
    .setDescription('Update the bots branding on the embed footers')
    .addStringOption(option => option.setName('text').setDescription('Want you want the bot to say')  .setRequired(true)), // user option defined
  async execute(interaction) {
    if (!interaction.member.permissions.has(Permissions.FLAGS.MANAGE_MESSAGES)) {
      await interaction.reply('You are unable to run this command because you don\'t have the required permission: Manage Messages.');
      return;
    }

    const serverId = interaction.guild.id
    const serverSettings = await Server.findOne({ serverId });
     const text = interaction.options.getString('text')?? 'No input provided';;
    if (!serverSettings) {
        try{
        await interaction.reply('Server settings not found. Please set them up using /setup.');
        return;
        }catch (error){
            try{
                interaction.reply("If you've run the set up command and still see this please contact support.")
            }catch{
                intrraction.followUp("If you've run the set up command and still see this please contact support.")
            }
            }
        }

    if (serverSettings.premium === "yes"){
       await Server.findOneAndUpdate({ serverId }, { $set: { Branding: text } });
      interaction.reply(`I've updated the branding on this server to ${text}`)
    } else {
      interaction.reply(`This command is reserved for premium servers only.`)
    }
  },
};