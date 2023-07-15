import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("say")
    .setDescription("Бот отправляет заданое вами сообщение")
    .addChannelOption(option => 
      option.setName("target_channel")
        .setDescription("Channel to send message in")
        .setRequired(true)
    )
    .addStringOption(option => 
      option.setName("text")
        .setDescription("Message to be sent in specified channel")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  
  execute(interaction) {
    const { options } = interaction;

    const targetChannelID = options.getChannel("target_channel")?.id;
    const message = options.getString("text");
    const targetChannel = interaction.guild.channels.cache.get(targetChannelID);

    interaction.reply({ content: "Сообщение было успешно отправлено", ephemeral: true });
    targetChannel.send({ content: message });
  }
}