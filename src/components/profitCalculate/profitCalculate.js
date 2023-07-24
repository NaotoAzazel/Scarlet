import { getJSONData } from "../utils.js";
const itemPriceFilePath = "newPrices.json";
const allItemsPrice = getJSONData(itemPriceFilePath);

const equalValueBoundary = 20; // заместо 20 можно написать число, которое будет задавать "границу" FAIRY-трейду

/** 
  * @param {Array} Входные данные
  * @returns {object} - Объект, который содержит суму предметов до разделителя и после,
  * процент выгодности
*/
export default function profitCalculate(itemsBeforeSeparator, itemsAfterSeparator) {
  function getPriceSum(items) {
    return items.reduce((sum, item) => {
      Object.keys(allItemsPrice).forEach(category => {
        if (allItemsPrice[category]?.[item]) {
          sum += allItemsPrice[category][item];
        }
      });
      return sum;
    }, 0);
  }

  const sumBefore = getPriceSum(itemsBeforeSeparator);
  const sumAfter = getPriceSum(itemsAfterSeparator);

  const profit = ((sumAfter - sumBefore) * 100) / sumAfter;
  const tradeStatus = profit < 0 ? 0 : 1;
  const embedColor = Math.abs(sumBefore - sumAfter) <= equalValueBoundary ? "Blue" : tradeStatus ? "Green" : "Red";

  return { sumBefore, sumAfter, profit, embedColor, tradeStatus };
}
