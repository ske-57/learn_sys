// services/generateIntroProtocolDocx.js
const fs = require('fs');
const path = require('path');
const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');

function pad2(n) {
  return String(n).padStart(2, '0');
}

/**
 * Приводит дату к формату "DD.MM.YYYY".
 * Поддерживает:
 * - Date
 * - "YYYY-MM-DD" / "YYYY-MM-DDTHH:mm:ss..."
 * - "DD.MM.YYYY" (оставляет как есть)
 * - любые другие строки (пытается распарсить Date, иначе вернёт как есть)
 */
function formatRussianDate(value) {
  if (!value) return '';

  // Date instance
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return '';
    return `${pad2(value.getDate())}.${pad2(value.getMonth() + 1)}.${value.getFullYear()}`;
  }

  // String
  if (typeof value === 'string') {
    const s = value.trim();
    if (!s) return '';

    // Already DD.MM.YYYY
    if (/^\d{2}\.\d{2}\.\d{4}$/.test(s)) return s;

    // YYYY-MM-DD (or ISO)
    const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m) return `${m[3]}.${m[2]}.${m[1]}`;

    // Try Date.parse as fallback
    const d = new Date(s);
    if (!Number.isNaN(d.getTime())) {
      return `${pad2(d.getDate())}.${pad2(d.getMonth() + 1)}.${d.getFullYear()}`;
    }

    // Unknown format — return as-is (чтобы не сломать ввод)
    return s;
  }

  return '';
}

/**
 * Нормализует ФИО под шаблон.
 * В шаблоне печатается: "{name} {last_name} {middle_name}" :contentReference[oaicite:1]{index=1}
 *
 * Предполагаем ввод "Иванов Иван Иванович" (Фамилия Имя Отчество):
 * -> name = "Иванов", last_name = "Иван", middle_name = "Иванович"
 */
function splitFio(fullName = '') {
  const parts = String(fullName).trim().split(/\s+/).filter(Boolean);

  return {
    name: parts[0] || '',
    last_name: parts[1] || '',
    middle_name: parts.slice(2).join(' ') || '',
  };
}

/**
 * data = {
 *   group_id: string | number,
 *   course_name: string,
 *   start_date?: Date | string,
 *   end_date?: Date | string,
 *   moisei_name?: string,
 *   employee: Array<{
 *     fullName?: string,            // "Иванов Иван Иванович"
 *     organization?: string,
 *     // либо уже разложенные:
 *     name?: string,
 *     last_name?: string,
 *     middle_name?: string,
 *     organization_name?: string
 *   }>
 * }
 */
function generateAcceptedProtocol(data) {
  if (!data || typeof data !== 'object') {
    throw new Error('generateAcceptedProtocol: data must be an object');
  }

  const group_id = data.group_id ?? '';
  const course_name = data.course_name ?? '';
  const moisei_name = data.moisei_name ?? '';

  const start_date = formatRussianDate(data.start_date) || formatRussianDate(new Date());
  const end_date = formatRussianDate(data.end_date) || '';

  const employeeRaw = Array.isArray(data.employee) ? data.employee : [];
  const employee = employeeRaw.map((e) => {
    const fio =
      (e && (e.name || e.last_name || e.middle_name))
        ? {
            name: e.name ?? '',
            last_name: e.last_name ?? '',
            middle_name: e.middle_name ?? '',
          }
        : splitFio(e?.fullName ?? '');

    return {
      ...fio,
      organization_name: e?.organization_name ?? e?.organization ?? '',
    };
  });

  // В проекте обычно хранят рядом с файлом сервиса или в папке templates.
  // Если у тебя шаблон лежит рядом с этим js-файлом:
  const templatePath = path.resolve(__dirname, './Protocol_add_remove_template.docx');

  // (Для твоего теста в контейнере можно так:)
  // const templatePath = '/mnt/data/Protocol_add_remove_template.docx';

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
    start_date,
    end_date,
    moisei_name,
    employee,
  });

  try {
    doc.render();
  } catch (error) {
    console.error('Ошибка при рендере протокола (add/remove template):', error);
    throw error;
  }

  return doc.getZip().generate({
    type: 'nodebuffer',
    compression: 'DEFLATE',
  });
}

module.exports = {
  generateAcceptedProtocol,
  formatRussianDate,
};
