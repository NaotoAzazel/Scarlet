import { ModalBuilder, TextInputStyle, TextInputBuilder, ActionRowBuilder, EmbedBuilder } from "discord.js";

export default {
  name: "interactionCreate",
  async execute(interaction, client) {
    if(interaction?.customId !== "application") return;

    const createTextInput = (customId, label, placeholder, style = TextInputStyle.Short, isRequired = true) => 
      new TextInputBuilder({ 
        customId, 
        label, 
        style, 
        required: isRequired,
        max_length: 512,
        min_length: 0,
        placeholder
      });

    const formattedValue = (text) => `\`\`\`${text}\`\`\``;
    
    const modal = new ModalBuilder({
      customId: `myModal-${interaction.user.id}`,
      title: `Заявка на должность ${interaction.values[0]}`
    })

    const nameAndAge = createTextInput("name", "Имя, возвраст", "Виталий, 11 лет");
    const prevExperience = createTextInput("experience", "Опыт на других серверах", "Был модератором на ...", TextInputStyle.Paragraph);
    const takeTime = createTextInput("takeTime", "Время которое вы готовы уделять", "От 6 часов в день");
    const timeZone = createTextInput("timeZone", "Ваш часовой пояс", "+8 часов от МСК времени");
    
    const nameAndAgeRow = new ActionRowBuilder().addComponents(nameAndAge);
    const prevExperienceRow = new ActionRowBuilder().addComponents(prevExperience);
    const takeTimeRow = new ActionRowBuilder().addComponents(takeTime);
    const timeZoneRow = new ActionRowBuilder().addComponents(timeZone);

    modal.addComponents(nameAndAgeRow, prevExperienceRow, takeTimeRow, timeZoneRow);

    await interaction.showModal(modal);

    const filter = (interaction) => interaction.customId === `myModal-${interaction.user.id}`;

    interaction
      .awaitModalSubmit({ filter, time: 600_000 })
      .then(async(modalInteraction) => {
        const nameAndAgeValue = modalInteraction.fields.getTextInputValue("name");
        const prevExperienceValue = modalInteraction.fields.getTextInputValue("experience");
        const takeTimeValue = modalInteraction.fields.getTextInputValue("takeTime");
        const timeZoneValue = modalInteraction.fields.getTextInputValue("timeZone");

        const resultEmbed = new EmbedBuilder()
          .setTitle(`Заявка на ${interaction.values[0]}`)
          .setDescription(`Ник: <@${interaction.user.id}>, ID: ${interaction.user.id}`)
          .addFields(
            { name: "Имя, возвраст", value: formattedValue(nameAndAgeValue) },
            { name: "Имеется ли опыт", value: formattedValue(prevExperienceValue) },
            { name: "Время которое вы готовы уделять", value: formattedValue(takeTimeValue) },
            { name: "Часовой пояс", value: formattedValue(timeZoneValue) }
          )
          .setColor("Red")
          .setTimestamp()

        await modalInteraction.reply({ content: "Вы успешно отправили свою заявку. Ожидайте ответа Администрации", ephemeral: true });
        const sentMessage = await client.channels.cache.get(process.env.REQUEST_LOG_CHANNEL);
        sentMessage.send({ embeds: [resultEmbed] });
      })
      .catch((err) => {
        interaction.reply({ content: `Вознишка ошибка отправки: ${err}`, ephemeral: true });
      })
  }
}