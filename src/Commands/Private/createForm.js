import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, StringSelectMenuBuilder, 
  ActionRowBuilder, StringSelectMenuOptionBuilder, ChannelType } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("createform")
    .setDescription("Создает форму с набором на должность")
    .addChannelOption(channel => {
      return channel
        .setName("channel")
        .setDescription("sd")
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)  
    })
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction, client) {
    const { options } = interaction;
    const channelId = options.getChannel("channel").id;
    const menuOptions = [
      { label: "Модератор", description: "Модерирует сервер", value: "Модератор" },
      { label: "Ивентер", description: "Проводит меро...", value: "Ивентер" }
    ];

    const imageEmbed = new EmbedBuilder()
      .setImage("https://cdn.discordapp.com/attachments/957976683439325214/1067864929807376495/vacancies.png")
    
    const informationEmbed = new EmbedBuilder()
      .setDescription("Хотите попасть в нашу команду администрации?\nВыберите должность, которая вам подходит")
      .setImage("https://cdn.discordapp.com/attachments/804360329638576151/1118964417435009194/20230615_210459.png")

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId("application")
      .setPlaceholder("Выберите должность")
      .addOptions(
        menuOptions.map((field) =>
          new StringSelectMenuOptionBuilder()
            .setLabel(field.label)
            .setDescription(field.description)
            .setValue(field.value)
        )
      )
    
    const actionRow = new ActionRowBuilder().addComponents(selectMenu);

    const sentMessage = await client.channels.cache.get(channelId);
    sentMessage.send({ embeds: [imageEmbed, informationEmbed], components: [actionRow] });

    interaction.reply({ content: `Вы успешно создали форму в канале <#${channelId}>`, ephemeral: true });
  }
}