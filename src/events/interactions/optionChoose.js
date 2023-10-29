import { ModalBuilder, TextInputStyle, TextInputBuilder, ActionRowBuilder, EmbedBuilder } from "discord.js";
import { createErrorEmbed, getDiscordTimestamp } from "../../components/utils.js";

const cooldowns = new Map();
const currentTime = new Date();
const cooldownTime = 3_600 * 1_000; // 1 час

export default {
  name: "interactionCreate",
  async execute(interaction, client) {
    if(interaction?.customId !== "application") return;
    const isTierListRole = interaction.values[0] === "Ивентер";
    const itemsList = [
      "Venom", "Ope", "Mochi", "Tori", "Pika", "Suna", "Ase", "Pbag", "Candycane", "World ender", "Iceborn rapier",
      "Legendary chest", "Rare chest", "Hoverboard", "Jester fit", "Flowers"
    ];

    const createTextInput = ({ customId, label, placeholder = "", style = TextInputStyle.Short, isRequired = true, value = "" }) => 
      new TextInputBuilder({ 
        customId, 
        label, 
        style, 
        required: isRequired,
        max_length: 512,
        min_length: 0,
        placeholder,
        value
      });

    const formattedValue = (text) => `\`\`\`${text}\`\`\``;
    const formattedList = itemsList.map(item => `${item} - ?`);
    const resultString = formattedList.join('\n');

    if (cooldowns.has(interaction.user.id)) {
      const lastCooldown = cooldowns.get(interaction.user.id);
      const elapsedTime = Date.now() - lastCooldown;
      const futureTime = getDiscordTimestamp(new Date(currentTime.getTime() + cooldownTime), "T"); 

      const errorEmbed = createErrorEmbed(`Вы не можете отправить заявку снова. Будет доступно в ${futureTime}`, "Подожди!");

      if (elapsedTime < cooldownTime) {
        await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        return;
      }
    }

    const modal = new ModalBuilder({
      customId: `myModal-${interaction.user.id}`,
      title: `Заявка на должность ${interaction.values[0]}`
    });

    const nameAndAge = createTextInput({ customId: "name", label: "Имя, возвраст", placeholder: "Виталий, 11 лет" });
    const prevExperience = createTextInput({ customId: "experience", label: "Опыт на других серверах", placeholder: "Был модератором на ...", style: TextInputStyle.Paragraph });
    const takeTime = createTextInput({ customId: "takeTime", label: "Время которое вы готовы уделять", placeholder: "От 6 часов в день" });
    const timeZone = createTextInput({ customId: "timeZone", label:"Ваш часовой пояс", placeholder: "+8 часов от МСК времени" });
    const check = createTextInput({ customId: "check", label: "Проверка(укажите цену на каждый предмет)", style: TextInputStyle.Paragraph, value: resultString });
    
    const nameAndAgeRow = new ActionRowBuilder().addComponents(nameAndAge);
    const prevExperienceRow = new ActionRowBuilder().addComponents(prevExperience);
    const takeTimeRow = new ActionRowBuilder().addComponents(takeTime);
    const timeZoneRow = new ActionRowBuilder().addComponents(timeZone);
    const checkRow = new ActionRowBuilder().addComponents(check);

    if (isTierListRole) {
      modal.addComponents(nameAndAgeRow, prevExperienceRow, takeTimeRow, timeZoneRow, checkRow);
    } else {
      modal.addComponents(nameAndAgeRow, prevExperienceRow, takeTimeRow, timeZoneRow);
    }

    await interaction.showModal(modal);

    const filter = (interaction) => interaction.customId === `myModal-${interaction.user.id}`;

    interaction
      .awaitModalSubmit({ filter, time: 600_000 })
      .then(async(modalInteraction) => {
        const nameAndAgeValue = modalInteraction.fields.getTextInputValue("name");
        const prevExperienceValue = modalInteraction.fields.getTextInputValue("experience");
        const takeTimeValue = modalInteraction.fields.getTextInputValue("takeTime");
        const timeZoneValue = modalInteraction.fields.getTextInputValue("timeZone");

        let checkValue;
        if (isTierListRole) {
          checkValue = modalInteraction.fields.getTextInputValue("check");
        }

        const resultEmbed = new EmbedBuilder()
          .setTitle(`Заявка на ${interaction.values[0]}`)
          .setDescription(`Ник: <@${interaction.user.id}>, ID: ${interaction.user.id}`)
          .addFields(
            { name: "Имя, возвраст", value: formattedValue(nameAndAgeValue) },
            { name: "Имеется ли опыт", value: formattedValue(prevExperienceValue) },
            { name: "Время которое вы готовы уделять", value: formattedValue(takeTimeValue) },
            { name: "Часовой пояс", value: formattedValue(timeZoneValue) },
          )
          .setColor("Red")
          .setTimestamp()
        
        if (isTierListRole) {
          resultEmbed.addFields({ name: "Проверка", value: formattedValue(checkValue) });
        }

        try {
          await modalInteraction.reply({ content: "Вы успешно отправили свою заявку. Ожидайте ответа Администрации", ephemeral: true });
          const sentMessage = await client.channels.cache.get(process.env.REQUEST_LOG_CHANNEL);
          sentMessage.send({ embeds: [resultEmbed] });
    
          cooldowns.set(interaction.user.id, Date.now());
        } catch(err) {
          console.log(err);
        }
      })
      .catch((err) => {
        console.log(err);
      })
  }
}