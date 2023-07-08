require("dotenv").config();
const fs = require("fs");

const createResultEmbed = require("./components/helpCommand/createResultEmbed.js");
const loadEvents = require("./handlers/eventHandler.js");
const { createSelectMenuList } = require("./components/utils.js")

const TOKEN = process.env.TOKEN;

const { Client, EmbedBuilder, GatewayIntentBits } = require("discord.js");
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// help command 
client.on("interactionCreate", async(interaction) => {
  if(!(interaction.isChatInputCommand() && interaction.commandName === "help")) return;

  const categoryType = {
    "Фрукты": "Информация о фруках режима \"Grand Piece Online\"", 
    "Предметы": "Информация о предметах режима \"Grand Piece Online\"",
    "Боссы": "Информация о боссах режима \"Grand Piece Online\"",
    "Прокачка": "Информация о самой эфективной прокачке режима \"Grand Piece Online\"",
  };

  const informationEmbed = new EmbedBuilder()
    .setTitle("Выберете категорию, о которой хотите узнать подробную информацию")
    .setColor("Red")

  const categoryTypeRow = createSelectMenuList(
    "Выберите категорию", 
    categoryType, 
    interaction, 
    true
  );

  const replyInteraction = await interaction.reply({
    embeds: [informationEmbed], 
    components: [categoryTypeRow], 
    ephemeral: true
  });
  
  const collector = replyInteraction.createMessageComponentCollector({
    filter: (user) => (user.user.id === interaction.user.id),
  });

  const history = [];

  collector.on("collect", async(selectedInteraction) => {
    const rawData = fs.readFileSync("dataBase.json");
    const jsonData = JSON.parse(rawData);
    
    const selectedCategory = selectedInteraction.values[0];
    const selectedCategoryObject = jsonData[selectedCategory] || {};
    
    const sortedKeys = Object.keys(selectedCategoryObject).sort();
    console.log(sortedKeys);
    
    const sortedObject = {};
    sortedKeys.forEach(key => {
      sortedObject[key] = selectedCategoryObject[key];
    });
    console.log(sortedObject);
    
    informationEmbed.setTitle(`Вы успешно выбрали категорию ${selectedCategory}. Выберете объект из списка ниже, о котором хотите узнать подробную информацию`);
    
    const listOfObjectsRow = createSelectMenuList(
      selectedCategory === "Прокачка" ? "Выберите способ прокачки" : "Выберите объект. Объкты в алфавитном порядке A-Z",
      sortedObject, 
      interaction, 
      false
    );
    
    if(categoryType[selectedCategory]) {
      selectedInteraction.update({embeds: [informationEmbed], components: [listOfObjectsRow]});
      history.push(selectedCategory);
    }

    if(!categoryType[selectedCategory]) {
      history.push(selectedCategory);

      try {
        const result = await createResultEmbed(history[0], history[1], history); // заменить входные данные history[0], history[1] на объект или сэт
        console.log(result);

        interaction.deleteReply();
        interaction.followUp({embeds: result, components: [], ephemeral: false});
      } catch(err) {
        console.error(err);
      }
    }
  });
});

client.login(TOKEN).then(() => {
  loadEvents(client);
});