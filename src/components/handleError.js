const fs = require('fs');
const rawData = fs.readFileSync("itemPrice.json");
const items = JSON.parse(rawData);

const fruitName = /(?<=\:).+?(?=\:)/g;

/** 
  * Обработчик ошибок
  @param {string} args - Входные данные
  @returns {Array} Массив ошибок, которые записываються с новой строки
*/
function handleErrors(args) {
  const numOfArgs = args.length;
  let errors = [], wrongWords = [];

  for (let i = 0; i < numOfArgs; i++) {
    // Проверка наличия элемента в JSON-файле
    if (args[i].indexOf("👉") < 0) {
      const matchResult = args[i].match(fruitName);
      if (matchResult && matchResult.length > 0) {
        const itemName = matchResult[0];
        if (!items[itemName]) 
          wrongWords.push(`<${args[i]}>`);
      }
    }
  }

  if(wrongWords.length)
    errors.push("Items not found: " + wrongWords.join(", "));
  
  return errors.join("\n");
}

module.exports = handleErrors;