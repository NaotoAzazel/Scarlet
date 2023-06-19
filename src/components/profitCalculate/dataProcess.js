const handleErrors = require("./handleError");

/** 
  * Обрабатывает строку предметов, введеных пользователем 
  * @param {string} args - Входные данные
  * @returns {object} Объект, который содержит предметов до разделителя и после,
  *  так же массив предметов что пользователь обменивает и на что обменивает
*/
function inputDataProcess(args) {
  const itemNameRegex = /(?<=\:).+?(?=\:)/g; // регулярное выражения для получения названия предмета из эмодзи
  const separatorPatterns = new Set(["👉", "👉🏻", "👉🏼", "👉🏽", "👉🏾", "👉🏿"]);
  
  let itemsBeforeSeparator = [], itemsAfterSeparator = [];
  let trading = "", lf = "";

  if(handleErrors(args).length > 35)
    throw new Error(handleErrors(args));
    
  let separatorEncountered = false;  
  for(let i = 0; i < args.length; i++) {
    if(separatorPatterns.has(args[i])) {
      separatorEncountered = true;
      continue;
    }
  
    if(!separatorEncountered) {
      itemsBeforeSeparator.push(args[i].match(itemNameRegex)[0]);
      trading += `<${args[i]}> `;
    } else {
      itemsAfterSeparator.push(args[i].match(itemNameRegex)[0]);
      lf += `<${args[i]}> `;
    };
  };
  
  return {
    itemsBeforeSeparator, 
    itemsAfterSeparator,
    trading,
    lf,
  };
}  

module.exports = inputDataProcess;
