const { SlashCommandBuilder } = require('@discordjs/builders');
const { Permissions } = require('discord.js');
const User = require('../models/user'); // Adjust path as needed

module.exports = {
    data: new SlashCommandBuilder()
        .setName('set-role')
        .setDescription('Set role based on user tier')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('The user to set the role for')
                .setRequired(true)),
    async execute(interaction) {
        try {
            const targetUser = interaction.options.getUser('user');

            // Fetch user's tier from database
            const userDoc = await User.findOne({ userId: targetUser.id, serverID: interaction.guildId });

            if (!userDoc) {
                return await interaction.reply(`${targetUser.username} does not have any points or is not registered.`);
            }

            let roleIdToAssign;

            // Assign roles based on user's tier
            switch (userDoc.tier) {
                case 'sapphire':
                    roleIdToAssign = '123456789012345678'; // Replace with your role ID
                    break;
                case 'emerald':
                    roleIdToAssign = '234567890123456789'; // Replace with your role ID
                    break;
                case 'diamond':
                    roleIdToAssign = '345678901234567890'; // Replace with your role ID
                    break;
                default:
                    return await interaction.reply(`${targetUser.username} does not have a valid tier.`);
            }

            // Ensure the bot has permissions to manage roles
            const guild = interaction.guild;
            if (!guild.me.permissions.has(Permissions.FLAGS.MANAGE_ROLES)) {
                return await interaction.reply('I do not have permission to manage roles.');
            }

            // Fetch the role by ID
            const role = guild.roles.cache.get(roleIdToAssign);

            if (!role) {
                return await interaction.reply(`Role with ID '${roleIdToAssign}' not found.`);
            }

            // Assign the role to the user
            const member = await guild.members.fetch(targetUser.id);
            await member.roles.add(role);

            await interaction.reply(`Role with ID '${roleIdToAssign}' successfully assigned to ${targetUser.username}.`);
        } catch (error) {
            console.error('Error setting role based on tier:', error);
            await interaction.reply('Error setting role. Please try again later.');
        }
    },
};
