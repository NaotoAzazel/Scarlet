import dotenv from 'dotenv';
dotenv.config();

import { SlashCommandBuilder } from "discord.js";
import { getJSONData, createSelectMenuList, createErrorEmbed } from "../../components/utils.js";
import resultEmbedCreator from "../../components/helpCommand/resultEmbedCreator.js";

export default {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Помогает узнать информацию про объект"),

  async execute(interaction) {
    if(interaction.channel.id !== process.env.COMMANDS_CHANNEL) {
      const errorEmbed = createErrorEmbed("Вы не можете использовать эту комманду в этом чате");
      return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    };

    const jsonData = getJSONData("dataBase.json");
    const categoryTypes = Object.keys(jsonData);

    const categoryTypeRow = createSelectMenuList({
      placeHolder: "Выберите категорию",
      items: categoryTypes, 
      interaction,
      customId: "categorySelect",
      addDescription: true
    });

    const replyInteraction = await interaction.reply({ components: [categoryTypeRow], ephemeral: true });

    const collector = replyInteraction.createMessageComponentCollector({
      filter: (user) => (user.user.id === interaction.user.id),
    });

    let category, subValue;
    const history = [];
    
    collector.on("collect", async (selectedInteraction) => {
      const selectedValue = selectedInteraction.values[0];
  
      switch (selectedInteraction.customId) {
        case "categorySelect": {
          category = selectedValue;
          history.push(category);
  
          const categoryData = jsonData[category];
          const keys = Object.keys(categoryData);
          let placeHolder;
  
          switch(category) {
            case "Фрукты": 
            case "Кастомные грипы": 
              placeHolder = "Выберите редкость объектов"; 
              break;
  
            case "Боссы": 
            case "Прокачка": 
              placeHolder = "Выберите мир"; 
              break;
  
            default: placeHolder = "Выберите сущность";
          }
  
          const selectMenuRow = createSelectMenuList({
            placeHolder, 
            items: keys,
            interaction,
            customId: "selectRow",
          });
  
          selectedInteraction.update({ components: [selectMenuRow] }); break;
        }
  
        case "selectRow": {
          subValue = selectedValue;
          history.push(subValue);
  
          const sortedKeys = Object.keys(jsonData[category][subValue]).sort();
  
          const emojiMapping = sortedKeys.map((key) => ({
            [key]: jsonData[category][subValue][key].emoji,
          }));
  
          const objectSelect = createSelectMenuList({
            placeHolder: "Выберите объект. Расположение в алфавитном порядке",
            items: emojiMapping,
            interaction,
            customId: "finalAnswer"
          });
  
          selectedInteraction.update({ components: [objectSelect] });
          break;
        }
  
        case "finalAnswer": {
          history.push(selectedValue);
  
          try {
            const selectedCategoryObject = jsonData[category][subValue];
            const selectedObject = selectedCategoryObject[selectedValue];
            
            if(!Object.keys(selectedObject).length) {
              throw new Error(`Не удалсь найти информацию про объект "${selectedValue}"`);
            }
            
            const result = await resultEmbedCreator(selectedObject, history);
  
            interaction.deleteReply();
            interaction.followUp({embeds: result, content: `<@${interaction.user.id}>, Ваш ответ`});
          } catch(err) {
            const errorEmbed = createErrorEmbed(String(err.message));
  
            console.error("Error:", err.message);
            selectedInteraction.update({embeds: [errorEmbed], content: `<@${interaction.user.id}>`, components: []});  
          }
  
          break;
        }
      }
    });
  }
}