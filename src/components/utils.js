const fs = require("fs");
const { StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder } = require("discord.js");

/**
 * Получает время последнего изменения файл с ценами на предметы
 * @param {string} filePath Путь к файлу
 * @returns {date} Дата последнего изменения файла
 */
const getLastModifiedTime = (filePath) => new Date(fs.statSync(filePath).mtime);

/**
 * Переводит время в timestamp Дискорд-формата
 * @param {date} date Дата изменения файла
 * @returns {string} timestamp Дискорд-формата
 */
const getDiscordTimestamp = (date) => `<t:${Math.floor(date.getTime() / 1000)}:D>`

/**
 * @param {Object} items поля списка
 * @param {string} placeHolder заголовок
 * @param {number} customId уникальный айди списка
 * @param {interaction} interaction interaction
 * @param {boolean} addDescription 
 * @returns {ActionRowBuilder} экземпляр содержащий список выбора
 */
function createSelectMenuList(placeHolder, items, interaction, addDescription) {
  if(items === undefined) return;

  const randomID = Math.random();
  const emojiCache = interaction.guild.emojis.cache;
  
  const list = new StringSelectMenuBuilder()
    .setCustomId(String(randomID))
    .setPlaceholder(placeHolder)

  const options = Object.keys(items).map((key) => {
    const objectEmoji = emojiCache.find(emoji => emoji.name === key)?.id;
    const optionBuilder = new StringSelectMenuOptionBuilder()
      .setLabel(key)
      .setValue(key);

    if (addDescription) 
      optionBuilder.setDescription(items[key]);

    if (objectEmoji)
      optionBuilder.setEmoji(objectEmoji);

    return optionBuilder;
  });

  list.addOptions(options);
  return new ActionRowBuilder().addComponents(list);
}

module.exports = { getLastModifiedTime, getDiscordTimestamp, createSelectMenuList };