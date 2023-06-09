const handleErrors = require("./handleError");

/** 
  * Обрабатывает строку предметов, введеных пользователем 
  * @param {string} args - Входные данные
  * @returns {object} Объект, который содержит предметов до разделителя и после,
  *  так же массив предметов что пользователь обменивает и на что обменивает
*/
function inputDataProcess(args) {
  const fruitName = /(?<=\:).+?(?=\:)/g; // регулярное выражения для получения названия предмета из эмодзи
  let numOfArgs = args.length, posOfSeparator = 0, itemsBeforeSeparator = [], itemsAfterSeparator = [];
  let trading = "", lf = "";

  // обрабатываем ошибки и в случае их наявности завершаем програму
  if(handleErrors(args).length)
    throw new Error(handleErrors(args));

  // ищем разделитель
  while(1) {
    if(args[posOfSeparator].indexOf("👉") >= 0) 
      break;
    else
      posOfSeparator++;
  }

  let l = 0;
  // записываем предметы до разделителя и после разделителя
  for(l; l < posOfSeparator; l++) {
    itemsBeforeSeparator.push(args[l].match(fruitName)[0]);
    trading += `<${args[l]}>` + " ";
  };
  l++ // инкрементируем счетчик, чтобы не записался разделитель в массив
  
  for(l; l < numOfArgs; l++) {
    itemsAfterSeparator.push(args[l].match(fruitName)[0]);
    lf += `<${args[l]}>` + " ";
  }

  return {
    itemsBeforeSeparator, 
    itemsAfterSeparator,
    tradeResult: trading,
    lfResult: lf,
  };
}  

module.exports = inputDataProcess;
