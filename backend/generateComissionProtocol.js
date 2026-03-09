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

function decodeXmlText(text = '') {
  return text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function readCellText(tcXml = '') {
  const parts = [];
  const re = /<w:t(?:\s[^>]*)?>([\s\S]*?)<\/w:t>/g;
  let m = re.exec(tcXml);
  while (m) {
    parts.push(decodeXmlText(m[1]));
    m = re.exec(tcXml);
  }
  return parts.join('').replace(/\s+/g, ' ').trim();
}

function upsertVMergeInCell(tcXml = '', mode = null, clearContent = false) {
  const match = tcXml.match(/^<w:tc\b([^>]*)>([\s\S]*?)<\/w:tc>$/);
  if (!match) return tcXml;

  const attrs = match[1] || '';
  const inner = match[2] || '';
  const tcPrMatch = inner.match(/<w:tcPr>[\s\S]*?<\/w:tcPr>/);
  if (!tcPrMatch) return tcXml;

  let tcPr = tcPrMatch[0]
    .replace(/<w:vMerge(?:\s[^>]*)?\/>/g, '')
    .replace(/<w:vMerge(?:\s[^>]*)?>[\s\S]*?<\/w:vMerge>/g, '');

  if (mode === 'restart') {
    tcPr = tcPr.replace('</w:tcPr>', '<w:vMerge w:val="restart"/></w:tcPr>');
  } else if (mode === 'continue') {
    tcPr = tcPr.replace('</w:tcPr>', '<w:vMerge/></w:tcPr>');
  }

  let content = inner.replace(/<w:tcPr>[\s\S]*?<\/w:tcPr>/, '');
  if (clearContent) {
    content = '<w:p/>';
  }

  return `<w:tc${attrs}>${tcPr}${content}</w:tc>`;
}

function mergeOrganizationColumn(documentXml = '') {
  const tableRegex = /<w:tbl>[\s\S]*?<\/w:tbl>/g;

  return documentXml.replace(tableRegex, (tblXml) => {
    if (!tblXml.includes('Наименование предприятия')) {
      return tblXml;
    }

    const rowRegex = /<w:tr\b[\s\S]*?<\/w:tr>/g;
    const rows = tblXml.match(rowRegex);
    if (!rows || rows.length === 0) return tblXml;

    const dataRowIndexes = [];
    const rowCells = [];

    for (let i = 0; i < rows.length; i += 1) {
      const row = rows[i];
      if (!row.includes('<w:numPr>')) continue;

      const cells = row.match(/<w:tc\b[\s\S]*?<\/w:tc>/g);
      if (!cells || cells.length < 3) continue;

      rowCells[i] = cells;
      dataRowIndexes.push(i);
    }

    if (dataRowIndexes.length === 0) return tblXml;

    let start = 0;
    while (start < dataRowIndexes.length) {
      const startRowIndex = dataRowIndexes[start];
      const startOrg = readCellText(rowCells[startRowIndex][2]);

      let end = start + 1;
      while (end < dataRowIndexes.length) {
        const currentIndex = dataRowIndexes[end];
        const currentOrg = readCellText(rowCells[currentIndex][2]);
        if (currentOrg !== startOrg) break;
        end += 1;
      }

      const groupSize = end - start;
      if (groupSize > 1 && startOrg) {
        const firstRowIndex = dataRowIndexes[start];
        rowCells[firstRowIndex][2] = upsertVMergeInCell(
          rowCells[firstRowIndex][2],
          'restart',
          false
        );

        for (let k = start + 1; k < end; k += 1) {
          const rowIndex = dataRowIndexes[k];
          rowCells[rowIndex][2] = upsertVMergeInCell(
            rowCells[rowIndex][2],
            'continue',
            true
          );
        }
      } else {
        const rowIndex = dataRowIndexes[start];
        rowCells[rowIndex][2] = upsertVMergeInCell(rowCells[rowIndex][2], null, false);
      }

      start = end;
    }

    const updatedRows = rows.slice();
    for (const rowIndex of dataRowIndexes) {
      const originalCells = rows[rowIndex].match(/<w:tc\b[\s\S]*?<\/w:tc>/g);
      if (!originalCells || originalCells.length !== rowCells[rowIndex].length) continue;

      let updatedRow = rows[rowIndex];
      for (let c = 0; c < originalCells.length; c += 1) {
        updatedRow = updatedRow.replace(originalCells[c], rowCells[rowIndex][c]);
      }
      updatedRows[rowIndex] = updatedRow;
    }

    let rebuiltTable = tblXml;
    for (let i = 0; i < rows.length; i += 1) {
      rebuiltTable = rebuiltTable.replace(rows[i], updatedRows[i]);
    }

    return rebuiltTable;
  });
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

  const group_id = data.group_id ?? '';
  const course_name = data.course_name ?? '';
  const hours = data.hours ?? '';
  const moisei_name = data.moisei_name ?? '';

  // В шаблоне именно end_date (а не date_current) :contentReference[oaicite:3]{index=3}
  const end_date =
    formatRussianDate(data.end_date) ||
    formatRussianDate(data.date_current) || // на случай старого контракта
    formatRussianDate(new Date());

  const employeeRaw = Array.isArray(data.employee) ? data.employee : [];
  const employee = employeeRaw.map((e, idx) => {
    const fio =
      (e && (e.name || e.last_name || e.middle_name))
        ? {
            name: e.name ?? '',
            last_name: e.last_name ?? '',
            middle_name: e.middle_name ?? '',
          }
        : splitFio(e?.fullName ?? e?.fio ?? '');

    return {
      ...fio,

      organization_name: e?.organization_name ?? e?.organization ?? '',
      grade: e?.grade ?? '',

      // "Номер билета" в шаблоне — {random_number} :contentReference[oaicite:4]{index=4}
      // если не передали — ставим порядковый номер, чтобы всегда заполнилось
      random_number: e?.random_number ?? e?.ticket_number ?? (idx + 1),

      // "Результат проверки знаний" — {courses_mark} :contentReference[oaicite:5]{index=5}
      courses_mark: e?.courses_mark ?? e?.mark ?? '',

      // "Заключение экзаменационной комиссии" — {conclusion} :contentReference[oaicite:6]{index=6}
      conclusion: e?.conclusion ?? '',
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

  const zipOut = doc.getZip();
  const xmlFilePath = 'word/document.xml';
  const documentXml = zipOut.file(xmlFilePath)?.asText();
  if (documentXml) {
    const mergedXml = mergeOrganizationColumn(documentXml);
    zipOut.file(xmlFilePath, mergedXml);
  }

  return zipOut.generate({
    type: 'nodebuffer',
    compression: 'DEFLATE',
  });
}

module.exports = {
  generateComissionProtocol,
  formatRussianDate,
};
