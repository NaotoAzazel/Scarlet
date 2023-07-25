/** 
  * @param {string} args
  * @returns {Array} - Предметы до разделителя и после,
  *  так же массив предметов что пользователь обменивает и на что обменивает
*/
export default function inputDataProcess(args) {
  const itemNameRegex = /(?<=\:).+?(?=\:)/g; // регулярное выражения для получения названия предмета из эмодзи
  const separatorPatterns = new Set(["👉", "👉🏻", "👉🏼", "👉🏽", "👉🏾", "👉🏿"]);
  
  let itemsBeforeSeparator = [], itemsAfterSeparator = [];
  let trading = "", lf = "";

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
