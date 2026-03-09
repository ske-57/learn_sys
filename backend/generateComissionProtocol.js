// services/generateProtocolDocx.js
const fs = require('fs');
const path = require('path');
const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');

function pad2(n) {
  return String(n).padStart(2, '0');
}

/**
 * Приводит дату к "DD.MM.YYYY".
 * Поддерживает:
 * - Date
 * - "YYYY-MM-DD" / ISO
 * - "DD.MM.YYYY"
 */
function formatRussianDate(value) {
  if (!value) return '';

  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return '';
    return `${pad2(value.getDate())}.${pad2(value.getMonth() + 1)}.${value.getFullYear()}`;
  }

  if (typeof value === 'string') {
    const s = value.trim();
    if (!s) return '';

    if (/^\d{2}\.\d{2}\.\d{4}$/.test(s)) return s;

    const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m) return `${m[3]}.${m[2]}.${m[1]}`;

    const d = new Date(s);
    if (!Number.isNaN(d.getTime())) {
      return `${pad2(d.getDate())}.${pad2(d.getMonth() + 1)}.${d.getFullYear()}`;
    }

    return s;
  }

  return '';
}

/**
 * Разбор ФИО под шаблон:
 * в документе выводится "{name} {last_name} {middle_name}" :contentReference[oaicite:1]{index=1}
 * Обычно вводят "Иванов Иван Иванович" (Фамилия Имя Отчество)
 */
function splitFio(fullName = '') {
  const parts = String(fullName).trim().split(/\s+/).filter(Boolean);
  return {
    name: parts[0] || '',
    last_name: parts[1] || '',
    middle_name: parts.slice(2).join(' ') || '',
  };
}

function sanitizeXmlText(value) {
  const s = String(value ?? '');
  // XML 1.0 allowed chars: #x9 #xA #xD #x20-#xD7FF #xE000-#xFFFD
  return s.replace(/[^\u0009\u000A\u000D\u0020-\uD7FF\uE000-\uFFFD]/g, '');
}

function normalizeOrg(value) {
  return sanitizeXmlText(value).trim().replace(/\s+/g, ' ').toLowerCase();
}

function stripXmlTags(xml) {
  return String(xml ?? '').replace(/<[^>]+>/g, '');
}

function decodeXmlEntities(text) {
  return String(text ?? '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function getCellTextByWidth(rowXml, width) {
  const regex = new RegExp(
    `<w:tc>[\\s\\S]*?<w:tcW w:w="${width}" w:type="dxa"\\/>[\\s\\S]*?<\\/w:tc>`,
    'g'
  );
  const match = rowXml.match(regex);
  if (!match || match.length === 0) return '';
  const raw = stripXmlTags(match[0]);
  return decodeXmlEntities(raw).trim();
}

function applyMergeToOrgCell(rowXml, restart) {
  return rowXml.replace(
    /(<w:tc>\s*<w:tcPr>[\s\S]*?<w:tcW w:w="2379" w:type="dxa"\/>[\s\S]*?)(<\/w:tcPr>)/,
    (_, tcPrStart, tcPrEnd) => {
      const cleaned = tcPrStart.replace(/\s*<w:vMerge(?:\s+w:val="[^"]*")?\s*\/>\s*/g, '');
      const mergeTag = restart ? '<w:vMerge w:val="restart"/>' : '<w:vMerge/>';
      return `${cleaned}${mergeTag}${tcPrEnd}`;
    }
  );
}

function mergeOrganizationsInCommissionTable(documentXml, organizationsInOrder) {
  const tableRegex = /<w:tbl[\s\S]*?<\/w:tbl>/g;
  const tables = documentXml.match(tableRegex);
  if (!tables || tables.length === 0) return documentXml;

  const targetTable = tables.find((tbl) => tbl.includes('Ф.И.О.') && tbl.includes('Наименование предприятия'));
  if (!targetTable) return documentXml;

  const rowRegex = /<w:tr[\s\S]*?<\/w:tr>/g;
  const rows = targetTable.match(rowRegex);
  if (!rows || rows.length === 0) return documentXml;

  const employeeRowIndexes = [];
  for (let i = 0; i < rows.length; i += 1) {
    const row = rows[i];
    const fioText = getCellTextByWidth(row, 2918);
    const normalizedFio = normalizeOrg(fioText);

    if (!normalizedFio) continue;
    if (normalizedFio === normalizeOrg('Ф.И.О.')) continue;
    if (/^\d+$/.test(normalizedFio)) continue; // row with numeric headers (2 etc.)
    if (!row.includes('<w:tcW w:w="2379" w:type="dxa"/>')) continue;

    employeeRowIndexes.push(i);
  }

  if (employeeRowIndexes.length === 0) return documentXml;
  if (!Array.isArray(organizationsInOrder) || organizationsInOrder.length === 0) return documentXml;

  let previousOrg = null;
  const limit = Math.min(employeeRowIndexes.length, organizationsInOrder.length);
  for (let i = 0; i < limit; i += 1) {
    const rowIndex = employeeRowIndexes[i];
    const row = rows[rowIndex];
    const currentOrg = normalizeOrg(organizationsInOrder[i]);
    const isRestart = currentOrg !== previousOrg;

    rows[rowIndex] = applyMergeToOrgCell(row, isRestart);

    previousOrg = currentOrg;
  }

  const mergedTable = rows.join('');
  return documentXml.replace(targetTable, mergedTable);
}

/**
 * data (вход) может быть "как угодно", но на выходе приводим к ключам шаблона:
 * {
 *   moisei_name?: string,
 *   group_id: string|number,
 *   end_date?: string|Date,        // в шаблоне: "от {end_date}" :contentReference[oaicite:2]{index=2}
 *   course_name: string,
 *   hours: string|number,
 *   employee: Array<{
 *     fullName?: string,
 *     organization?: string,
 *     grade?: string,
 *     mark?: string,
 *     // либо уже подготовленные поля:
 *     name?: string, last_name?: string, middle_name?: string,
 *     organization_name?: string,
 *     random_number?: string|number,
 *     courses_mark?: string,
 *     conclusion?: string
 *   }>
 * }
 */
function generateComissionProtocol(data) {
  if (!data || typeof data !== 'object') {
    throw new Error('generateComissionProtocol: data must be an object');
  }

  const group_id = sanitizeXmlText(data.group_id ?? '');
  const course_name = sanitizeXmlText(data.course_name ?? '');
  const hours = sanitizeXmlText(data.hours ?? '');
  const moisei_name = sanitizeXmlText(data.moisei_name ?? '');

  // В шаблоне именно end_date (а не date_current) :contentReference[oaicite:3]{index=3}
  const end_date =
    formatRussianDate(data.end_date) ||
    formatRussianDate(data.date_current) || // на случай старого контракта
    formatRussianDate(new Date());

  const employeeRaw = Array.isArray(data.employee) ? data.employee : [];
  const organizationsInOrder = employeeRaw.map((e) => sanitizeXmlText(e?.organization_name ?? e?.organization ?? ''));
  const employee = employeeRaw.map((e, idx) => {
    const fio = (e && (e.name || e.last_name || e.middle_name))
      ? {
          // Template uses "{name} {last_name} {middle_name}".
          // Put data in FIO order: Surname Name MiddleName.
          name: sanitizeXmlText(e.last_name ?? ''),
          last_name: sanitizeXmlText(e.name ?? ''),
          middle_name: sanitizeXmlText(e.middle_name ?? ''),
        }
      : splitFio(e?.fullName ?? e?.fio ?? '');

    return {
      ...fio,

      organization_name: sanitizeXmlText(e?.organization_name ?? e?.organization ?? ''),
      grade: sanitizeXmlText(e?.grade ?? ''),

      // "Номер билета" в шаблоне — {random_number} :contentReference[oaicite:4]{index=4}
      // если не передали — ставим порядковый номер, чтобы всегда заполнилось
      random_number: sanitizeXmlText(e?.random_number ?? e?.ticket_number ?? (idx + 1)),

      // "Результат проверки знаний" — {courses_mark} :contentReference[oaicite:5]{index=5}
      courses_mark: sanitizeXmlText(e?.courses_mark ?? e?.mark ?? ''),

      // "Заключение экзаменационной комиссии" — {conclusion} :contentReference[oaicite:6]{index=6}
      conclusion: sanitizeXmlText(e?.conclusion ?? ''),
    };
  });

  // Если шаблон лежит рядом с этим файлом:
  const templatePath = path.resolve(__dirname, './Protocol-comission-template.docx');

  // Для теста в вашем окружении (как у тебя загружен файл):
  // const templatePath = '/mnt/data/Protocol-comission-template.docx';

  const content = fs.readFileSync(templatePath, 'binary');
  const zip = new PizZip(content);

  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
    nullGetter: () => '',
  });

  doc.setData({
    moisei_name,
    group_id,
    end_date,
    course_name,
    hours,
    employee,
  });

  try {
    doc.render();
  } catch (error) {
    console.error('Ошибка при рендере comission-протокола:', error);
    throw error;
  }

  const renderedZip = doc.getZip();
  const docFile = renderedZip.file('word/document.xml');
  if (docFile) {
    const sourceXml = docFile.asText();
    const mergedXml = mergeOrganizationsInCommissionTable(sourceXml, organizationsInOrder);
    renderedZip.file('word/document.xml', mergedXml);
  }

  return renderedZip.generate({
    type: 'nodebuffer',
    compression: 'DEFLATE',
  });
}

module.exports = {
  generateComissionProtocol,
  formatRussianDate,
};
