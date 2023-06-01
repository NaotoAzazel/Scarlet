const fs = require("fs");
const rawData = fs.readFileSync("itemPrice.json");
const items = JSON.parse(rawData);

/** 
  * Считает процент выгодности на основе входных данных  
  * @param {Array} - Входные данные
  * @returns {{object}} Объект, который содержит суму предметов до разделителя и после,
  * процент выгодности
*/
function profitCalculate(itemsBeforeSeparator, itemsAfterSeparator) {
  let sumBefore = 0, sumAfter = 0, tradeStatus = "";

  // считаем суму предметов до и после разделителя
  for(let i = 0; i < itemsBeforeSeparator.length; i++) 
    sumBefore += items[itemsBeforeSeparator[i]];
  
  for(let i = 0; i < itemsAfterSeparator.length; i++) 
    sumAfter += items[itemsAfterSeparator[i]];
  
  // считаем profit от сделки
  const profit = ((sumAfter - sumBefore) * 100) / sumAfter;
  profit < 0 ? (tradeStatus = "LOSE", embedColor = "#ED4245") : (tradeStatus = "WIN", embedColor = "#57F287");

  // находим большее и меньшее число
  let biggest = sumBefore > sumAfter ? sumBefore : sumAfter;
  let smaller = sumBefore < sumAfter ? sumBefore : sumAfter;

  // проверяем если обмен равноценный
  if(biggest - smaller <= 20) // заместо 20 можно написать число, которое будет давать "границу" FAIRY-трейду
  tradeStatus = "FAIR", embedColor = "Blue";

  return { sumBefore, sumAfter, profit, embedColor, tradeStatus };
}

module.exports = profitCalculate;