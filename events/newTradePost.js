const { Events } = require('discord.js');
const config = require('../config.js');

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
    if (message.author.bot || !message.member.manageable) {
      return;
    }
    
    // Find the last post this member had in the same channel
    var messages = await message.channel.messages.fetch({ limit: 50, before: message.id })
      .then(messages => messages.filter(m => m.author.id === message.author.id));
      
    console.log(messages);
    message.reply({ content: 'hey', ephemeral: true });
  }
}