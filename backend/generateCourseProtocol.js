// services/generateProtocolDocx.js
const fs = require('fs');
const path = require('path');
const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');

// Функция для красивой даты по-русски (если хочешь считать дату на бэке)
function formatRussianDate(date) {
  const months = [
    'января', 'февраля', 'марта', 'апреля',
    'мая', 'июня', 'июля', 'августа',
    'сентября', 'октября', 'ноября', 'декабря',
  ];

  const d = date.getDate();
  const m = months[date.getMonth()];
  const y = date.getFullYear();

  return `${d} ${m} ${y} года`;
}

/**
 * data = {
 *   group_id: string,
 *   course_name: string,
 *   hours: string,
 *   date_current?: string, // если не передашь — возьмём текущую
 *   employee: [
 *     { id, fullName, organization, grade, mark }
 *   ]
 * }
 */
function generateProtocolDocx(data) {
  const {
    group_id,
    course_name,
    hours,
    employee,
  } = data;

  const date_current = data.date_current || formatRussianDate(new Date());

  const templatePath = path.resolve(__dirname, './Protocol-template.docx');
  const content = fs.readFileSync(templatePath, 'binary');

  const zip = new PizZip(content);
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
  });

  doc.setData({
    group_id,
    course_name,
    hours,
    date_current,
    employee,
  });

  try {
    doc.render();
  } catch (error) {
    console.error('Ошибка при рендере шаблона:', error);
    throw error;
  }

  const buf = doc.getZip().generate({
    type: 'nodebuffer',
    compression: 'DEFLATE',
  });

  return buf;
}

module.exports = {
  generateProtocolDocx,
  formatRussianDate,
};
