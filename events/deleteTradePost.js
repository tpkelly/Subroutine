const { Events } = require('discord.js');
const config = require('../config.js');

const searchWindowInDays = 6;

module.exports = {
  name: Events.MessageDelete,
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
    if (message.author.bot || !message.member.manageable) {
      return;
    }
  
    var createdAgoMillis = Date.now() - message.createdTimestamp;
    // Ignore old messages, or ones that were only just deleted (probably by the bot)
    if (createdAgoMillis > 10000 && createdAgoMillis < searchWindowInDays * 24 * 60 * 60 * 1000) {
      client.deletedMessages.push({ channelId: message.channel.id, authorId: message.author.id, createdTimestamp: message.createdTimestamp });
    }
  }
}