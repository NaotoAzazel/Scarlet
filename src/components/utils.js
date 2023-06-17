const fs = require("fs");

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

module.exports = {getLastModifiedTime, getDiscordTimestamp};