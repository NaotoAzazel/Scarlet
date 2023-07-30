import dotenv from 'dotenv'
dotenv.config();

import { SlashCommandBuilder, PermissionFlagsBits, ButtonBuilder, ButtonStyle, ActionRowBuilder } from "discord.js";
import { createErrorEmbed, getJSONData, getClosestItem, saveJSONData, createLogEmbed } from "../../components/utils.js";

export default {
  data: new SlashCommandBuilder()
    .setName("delete")
    .setDescription("Удаляет предмет из файла цен")
    .addStringOption(option => 
      option.setName("item_name")
        .setDescription("Item name")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction, client) {
    const { options } = interaction;
    const itemName = options.getString("item_name");
    
    const allPrices = getJSONData("newPrices.json");
    try {
      let isFind = false, itemCategory = "";

      for(const category in allPrices) {
        if(allPrices[category]?.[itemName]) { 
          isFind = true, itemCategory = category;
          break;
        }
      }

      if(!isFind) {
        const closestItem = getClosestItem(allPrices, itemName);

        if(closestItem) {
          const confirmDelete = new ButtonBuilder()
            .setCustomId(`confirm_delete:${closestItem}`)
            .setLabel("Удалить")
            .setStyle(ButtonStyle.Danger)

          var row = new ActionRowBuilder()
            .addComponents(confirmDelete)

          throw new Error(`Предмет с названием "${itemName}" не найден. Возможно, вы имели в виду "${closestItem}". Если это так то нажмите на кнопку ниже для удаления предмета`);
        } else { 
          throw new Error(`Не удалось найти предмет с названием "${itemName}"`) 
        }
      }

      delete allPrices[itemCategory][itemName];
      saveJSONData("newPrice.json", allPrices);

      const logChannelId = process.env.LOG_CHANNEL;
      const sentMessage = await client.channels.cache.get(logChannelId);
      const logEmbed = createLogEmbed("Удаление предмета", interaction, `Удалил предмет "${itemName}"`);

      sentMessage.send({ content: `<@${interaction.user.id}>`, embeds: [logEmbed] });
      await interaction.reply({ content: `Предмет "${itemName}" успешно удален из файла.`, ephemeral: true });
    } catch(err) {
      const errorEmbed = createErrorEmbed(err.message);
      interaction.reply({ embeds: [errorEmbed], components: row ? [row] : [], ephemeral: true });
    }
  }
}