// services/generateIntroProtocolDocx.js
const fs = require('fs');
const path = require('path');
const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');

// Если захочешь считать дату на бэке
function formatRussianDate(date) {
  const months = [
    'января', 'февраля', 'марта', 'апреля',
    'мая', 'июня', 'июля', 'августа',
    'сентября', 'октября', 'ноября', 'декабря',
  ];

  if (date instanceof Date) {
    const d = date.getDay();
    const m = months[date.getMonth()];
    const y = date.getFullYear()
    return `${d}.${m}.${y} `;
  } else {
    const data = date.split('-');
    const d = data[2].substring(0,2);
    const m = data[1];
    const y = data[0];
    return `${d}.${m}.${y} `;
  }

  return 'Date is undefined!'

  
}

/**
 * data = {
 *   group_id: string | number,
 *   course_name: string,
 *   hours: number | string,
 *   reason: string,          // "Очередная" / "Внеочередная"
 *   training_org: string,    // обучающая организация
 *   customer_org?: string,   // заказчик (если нужен)
 *   start_date?: string,     // "11.09.2025" или уже красиво
 *   end_date?: string,       // "20.09.2025"
 *   employee: [
 *     {
 *       id?: number,
 *       fullName: string,
 *       organization: string,
 *       grade?: string,
 *     }
 *   ]
 * }
 */
function generateAcceptedProtocol(data) {
  const {
    group_id,
    course_name,
    hours,
    reason,
    training_org,
    customer_org,
    employee,
  } = data;

  // Если даты не переданы — можно подставить что-то дефолтное
  const formatedStartDate = formatRussianDate(data.start_date) || '';
  const formatedEndDate = formatRussianDate(data.end_date) || '';
  const start_date = formatedStartDate || formatRussianDate(new Date());
  const end_date = formatedEndDate|| '';

  const templatePath = path.resolve(__dirname, './Protocol-accepted-template.docx');
  const content = fs.readFileSync(templatePath, 'binary');

  const zip = new PizZip(content);
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
    nullGetter: () => '',
  });

  doc.setData({
    group_id,
    course_name,
    hours,
    reason,
    training_org,
    customer_org,
    start_date,
    end_date,
    employee,
  });

  try {
    doc.render();
  } catch (error) {
    console.error('Ошибка при рендере intro-протокола:', error);
    throw error;
  }

  const buf = doc.getZip().generate({
    type: 'nodebuffer',
    compression: 'DEFLATE',
  });

  return buf;
}

module.exports = {
  generateAcceptedProtocol,
  formatRussianDate,
};
