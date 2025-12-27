// services/generateIntroProtocolDocx.js
const fs = require('fs');
const path = require('path');
const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');

function pad2(n) {
  return String(n).padStart(2, '0');
}

/**
 * Формат: "DD.MM.YYYY"
 * Поддерживает Date, "YYYY-MM-DD" / ISO, "DD.MM.YYYY"
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
 * В шаблоне по сотруднику: {name} {last_name} {middle_name} :contentReference[oaicite:1]{index=1}
 * Ожидаем ввод "Иванов Иван Иванович" => name=Иванов, last_name=Иван, middle_name=Иванович
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
 * Делает поля lesson_date_01..lesson_date_20 так, чтобы секции {#lesson_date_01}{lesson_date_01}{/lesson_date_01}
 * корректно отрабатывали (используем массив из 1 объекта или пустой массив). :contentReference[oaicite:2]{index=2}
 */
function buildLessonDateSections(dates = []) {
  const out = {};
  for (let i = 1; i <= 20; i++) {
    const key = `lesson_date_${pad2(i)}`;
    const val = dates[i - 1] ? formatRussianDate(dates[i - 1]) : '';
    out[key] = val ? [{ [key]: val }] : [];
  }
  return out;
}

/**
 * data (вход):
 * {
 *   moisei_name?: string,
 *   group_id: string|number,
 *   course_name: string,
 *   hours: number|string,
 *   start_date?: string|Date,
 *   end_date?: string|Date,
 *   employee: [{ fullName? | fio? | name/last_name/middle_name, organization? ... }],
 *   schedule?: [{ lesson_date, lesson_hours, course_lesson_name }],
 *   lesson?:    [{ lesson_date, lesson_hours, course_lesson_name }], // поддержка старого имени
 * }
 */
function generateVisitingProtocol(data) {
  if (!data || typeof data !== 'object') {
    throw new Error('generateVisitingProtocol: data must be an object');
  }

  const group_id = data.group_id ?? '';
  const course_name = data.course_name ?? '';
  const hours = data.hours ?? '';
  const moisei_name = data.moisei_name ?? '';

  const start_date = formatRussianDate(data.start_date) || formatRussianDate(new Date());
  const end_date = formatRussianDate(data.end_date) || '';

  // employee -> массив объектов с name/last_name/middle_name
  const employeeRaw = Array.isArray(data.employee) ? data.employee : [];
  const employee = employeeRaw.map((e) => {
    const fio =
      (e && (e.name || e.last_name || e.middle_name))
        ? {
            name: e.name ?? '',
            last_name: e.last_name ?? '',
            middle_name: e.middle_name ?? '',
          }
        : splitFio(e?.fullName ?? e?.fio ?? '');

    // organization_name в этом шаблоне не используется, но можно оставить на будущее
    return {
      ...fio,
      organization_name: e?.organization_name ?? e?.organization ?? '',
    };
  });

  // schedule (в шаблоне именно {#schedule}...{/schedule}) :contentReference[oaicite:3]{index=3}
  const scheduleRaw = Array.isArray(data.schedule)
    ? data.schedule
    : (Array.isArray(data.lesson) ? data.lesson : []);

  const schedule = scheduleRaw.map((l) => ({
    lesson_date: formatRussianDate(l?.lesson_date) || '',
    lesson_hours: l?.lesson_hours ?? '',
    course_lesson_name: l?.course_lesson_name ?? '',
  }));

  // lesson_date_01..lesson_date_20 — берём из schedule дат (первые 20)
  const lessonDates = schedule
    .map((x) => x.lesson_date)
    .filter(Boolean)
    .slice(0, 20);

  const lessonDateSections = buildLessonDateSections(lessonDates);

  const templatePath = path.resolve(__dirname, './Protocol-visiting-template.docx');
  // для теста в вашем окружении можно так:
  // const templatePath = '/mnt/data/Protocol-visiting-template.docx';

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
    course_name,
    hours,
    start_date,
    end_date,

    // блок посещаемости
    ...lessonDateSections,
    employee,

    // блок "Учет работы преподавателя"
    schedule,
  });

  try {
    doc.render();
  } catch (error) {
    console.error('Ошибка при рендере visit-протокола:', error);
    throw error;
  }

  return doc.getZip().generate({
    type: 'nodebuffer',
    compression: 'DEFLATE',
  });
}

module.exports = {
  generateVisitingProtocol,
  formatRussianDate,
};
