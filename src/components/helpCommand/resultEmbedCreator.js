import ColorThief from "colorthief";

/**
 * @param {string} imageURL 
 * @returns {number} Числовое предсталение цвета
 */
async function getColorNumberFromImageURL(imageURL) {
  const colorArray = await ColorThief.getColor(imageURL);
  const colorNumber = (colorArray[0] * 256 * 256) + (colorArray[1] * 256) + colorArray[2];
  return colorNumber;
}

/**
 * @param {object} selectedObject 
 * @param {boolean} Есть ли промежуточная картинка. Для правильной обработки полей
 * @returns {Array} Массив полей
 */
function createField(selectedObject, hasIntermediateImage = false) {
  return Object.entries(selectedObject).flatMap(([key, value]) => {
    const isInline = String(value).length < 30;

    if(Array.isArray(value) && !hasIntermediateImage) {
      const fieldValue = value.map((field) => Object.values(field).join(' - ')).join('\n');
      
      return { name: key, value: `\`\`\`${fieldValue}\`\`\``, inline: isInline };
    } else if(Array.isArray(value) && hasIntermediateImage) {
      return value.map(fields => ({ name: Object.values(fields)[0], value: `\`\`\`${Object.values(fields)[1]}\`\`\``, inline: isInline }))
    }

    return { name: key, value:`\`\`\`${value}\`\`\``, inline: isInline };
  });  
};

/**
 * @param {string} selectedCategory 
 * @param {string} essence 
 * @param {string} targetObject 
 * @param {Array} history 
 * @returns {Array} Массив embed`ов
 */
export default async function resultEmbedCreator(selectedObject, history) {
  const { fields, intermediateImage, objectImage, author } = selectedObject;
  const resultEmbeds = [];
  const stripImage = "https://cdn.discordapp.com/attachments/804360329638576151/1118964417435009194/20230615_210459.png";
  const title = history.join(" -> ");
  const redColor = 15548997;
  const embedColor = objectImage ? await getColorNumberFromImageURL(objectImage) : redColor;

  if(intermediateImage) {
    // получение всех ключей кроме последнего
    const filteredKeys = Object.keys(fields).slice(0, -1);
    const filteredFields = filteredKeys.reduce((obj, key) => {
      obj[key] = fields[key];
      return obj;
    }, {});

    const infoEmbed = {
      title,
      color: embedColor,
      fields: createField(filteredFields),
      image: { url: stripImage}
    };

    const intermediateEmbed = { image: {url: intermediateImage}, color: embedColor };

    const lastKey = Object.keys(fields).slice(-1)[0];
    const lastField = { [lastKey]: fields[lastKey] };

    const skillsEmbed = {
      fields: createField(lastField, true),
      color: embedColor,
      image: { url: objectImage }
    };

    resultEmbeds.push(infoEmbed, intermediateEmbed, skillsEmbed);
  } else {
    const result = {
      title,
      fields: createField(fields),
      image: { url: objectImage || ""  },
      footer: { text: author ? `Автор страницы: ${author}` : ""},
    };

    resultEmbeds.push(result);
  };

  return resultEmbeds;
}
