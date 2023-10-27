import dotenv from 'dotenv'
dotenv.config();

import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";
import { createErrorEmbed, getJSONData, createLogEmbed } from "../../components/utils.js";
import fs from "fs";

const categories = Object.keys(getJSONData("newPrices.json")).map(category => {
  return { name: category, value: category };
});

export default {
  data: new SlashCommandBuilder()
    .setName("add")
    .setDescription("Добавляет предмет в файл цен")
    .addStringOption(option => 
      option.setName("item_category")
        .setDescription("item category")
        .setRequired(true)
        .addChoices(...categories)
    )
    .addStringOption(option => 
      option.setName("item_name")
        .setDescription("Item name")
        .setRequired(true)
    )
    .addIntegerOption(option => 
      option.setName("price")
        .setDescription("Item price")
        .setMinValue(0)
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction, client) {
    const { options } = interaction;
    const itemCategory = options.getString("item_category");
    const itemName = options.getString("item_name");
    const price = options.getInteger("price");
    
    const allPrices = getJSONData("newPrices.json");
    try {
      for(const category in allPrices) {
        if(allPrices[category]?.[itemName]) throw new Error(`Предмет с названием "${itemName}" уже записан в файле`);
      }

      allPrices[itemCategory][itemName] = price;
      const jsonString = JSON.stringify(allPrices, null, 2);

      fs.writeFileSync("newPrices.json", jsonString, "utf-8");
      
      const logChannelId = process.env.LOG_CHANNEL;
      const sentMessage = await client.channels.cache.get(logChannelId);
      const logEmbed = createLogEmbed("Добавление предмета", interaction, `Добавил **${itemName}** с ценой **${price}** в категорию **${itemCategory}**`)

      sentMessage.send({ content: `<@${interaction.user.id}>`, embeds: [logEmbed] });
      await interaction.reply({ content: `Предмет с названием "${itemName}" и ценой "${price}" был успешно записан в файл`, ephemeral: true });
    } catch(err) {
      const errorEmbed = createErrorEmbed(err.message);
      interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
  }
}