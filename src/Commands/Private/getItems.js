import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from "discord.js";
import { getJSONData } from "../../components/utils.js";

function createFields(object) {
  return Object.keys(object).map(categoryName => {
    const categoryFields = object[categoryName];
    const categoryString = Object.keys(categoryFields)
      .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" })) // сортировка в алфавитном порядке
      .map(fieldName => `${fieldName}: ${categoryFields[fieldName]}`)
      .join("\n");

    return {
      name: categoryName,
      value: `\`\`\`${categoryString}\`\`\``,
      inline: true
    };
  });
};

export default {
  data: new SlashCommandBuilder()
    .setName("items")
    .setDescription("Выводит содержимое файла с ценами")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  execute(interaction) {
    const allPrices = getJSONData("newPrices.json");
    const fields = createFields(allPrices); 

    const replyEmbed = new EmbedBuilder()
      .setTitle("Данные с файла")
      .setColor("Red")
      .setDescription("*Все предметы расположены в алфавитном порядке своей категории*")
      .addFields(fields)

    interaction.reply({ embeds: [replyEmbed], ephemeral: true });
  } 
}