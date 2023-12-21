const { Events } = require('discord.js');
const config = require('../config.js');

const searchWindowInDays = 6;
const pinnedMessage = ':pushpin: When re-listing a post, remember to delete the previous one. Messages will be automatically deleted if you re-list within 7 days of a previous post. Check the pinned post for the channel guidelines :pushpin:'

module.exports = {
  name: Events.MessageCreate,
  execute: async (client, args) => {
    let message = args[0]
    
    // Ignore DMs and threads
    if (!message.inGuild()) {
      return;
    }
    
    var guildConfig = config[message.guild.id];
    
    // Only look at the channels in the Trade/Aid category - this should also ignore threads
    if (message.channel.parent.id != guildConfig.tradeCategory) {
      return;
    }
    
    // Ignore mods and bots
    var channelMember = await message.guild.members.fetch(message.author.id);
    if (message.author.bot || !channelMember.manageable) {
      return;
    }
   
    // Find the last post this member had in the same channel
    var searchWindowMillis = searchWindowInDays * 24 * 60 * 60 * 1000;
    var recentMessages = await message.channel.messages.fetch({ limit: 50, before: message.id })
    var messages = recentMessages.filter(m => m.author.id === message.author.id && (message.createdTimestamp - m.createdTimestamp) < searchWindowMillis);
    var botMessages = recentMessages.filter(m => m.author.id === client.user.id && m.content.startsWith(':pushpin:'));
      
    // Remove cached messages that are too old to care about
    client.deletedMessages = client.deletedMessages.filter(m => message.createdTimestamp - m.createdTimestamp < searchWindowMillis)
    
    // Check recently deleted messages for violations
    var deletedMessages = client.deletedMessages.filter(m => m.authorId == message.author.id && m.channelId == message.channel.id)
      
    if (!messages.size && !deletedMessages.length) {
      for (const botMessage of botMessages.values()) {
        botMessage.delete();
      }
      message.channel.send({ content: pinnedMessage });
      return;
    }

    var allMessages = [...(messages.values())];
    allMessages = allMessages.concat([...deletedMessages]);
    var earliestTimestamp = allMessages.reduce((a, b) => Math.min(a.createdTimestamp, b.createdTimestamp));
    var timeLimit = Math.floor(earliestTimestamp/1000) + 7 * 24 * 60 * 60;

    var reply = await message.reply({ content: `Quick reminder: there's a 7-day cooldown for posts in our Trade/Aid channels. Even if you delete your original message, the timer still sets sail ⛵ If you have fresh loot or parts to share, just give it a week or feel free to edit your original message. Fair winds! 🌊⚓\n\nYou can post again <t:${timeLimit}:R>` });
    
    await message.delete();
    
    // Post notification to mods
    await message.guild.channels.fetch(guildConfig.notifyChannel)
      .then(channel => channel.send({ embeds: [{ title: 'Removed Trade/Aid Post', description: `Deleted post from ${message.author.tag} (${message.author.id}) in <#${message.channel.id}>`, color: 0xff0000 }]}));
    
    // Get rid of the bot reply to the user after 60 seconds
    setTimeout(() => reply.delete(), 60000);
  }
}