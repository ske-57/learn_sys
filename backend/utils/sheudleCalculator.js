const calendar = require('isdayoff')();
const WORK_DAY_HOURS = 8;

const WORK_CODES = new Set([0, 2, 4]);

const pad2 = (n) => String(n).padStart(2, '0');

// ВАЖНО: без toISOString(), чтобы не было UTC-сдвига
const toYMD = (date) =>
  `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;

const normalizeStartDate = (startDateStr) => {
  // Date instance
  if (startDateStr instanceof Date) {
    if (Number.isNaN(startDateStr.getTime())) throw new Error('Invalid start_date');
    return new Date(startDateStr.getFullYear(), startDateStr.getMonth(), startDateStr.getDate());
  }

  const s = String(startDateStr ?? '').trim();
  if (!s) throw new Error('Invalid start_date');

  // "YYYY-MM-DD..." (включая ISO "YYYY-MM-DDTHH:mm:ssZ")
  const ymd = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (ymd) {
    // Парсим как момент, чтобы корректно обработать ISO со временем и Z/offset,
    // и берём ЛОКАЛЬНУЮ дату (как её понимает сервер).
    const d = new Date(s);
    if (!Number.isNaN(d.getTime())) {
      return new Date(d.getFullYear(), d.getMonth(), d.getDate());
    }
    // если вдруг это был просто "YYYY-MM-DD" и Date не распарсился — fallback
    const [_, Y, M, D] = ymd;
    return new Date(Number(Y), Number(M) - 1, Number(D));
  }

  // "DD.MM.YYYY"
  const dmy = s.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (dmy) {
    const [_, D, M, Y] = dmy;
    return new Date(Number(Y), Number(M) - 1, Number(D));
  }

  // общий fallback
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) throw new Error('Invalid start_date');
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
};

async function calculateScheduleByLessons(startDateStr, lessons) {
  if (!startDateStr) throw new Error('start_date is required');
  if (!Array.isArray(lessons) || lessons.length === 0) {
    return { schedule: [], end_date: null };
  }

  // пропускаем уроки с нулевыми/отрицательными часами, чтобы не зациклиться
  const safeLessons = lessons
    .map((l) => ({ name: l?.name ?? '', hours: Number(l?.hours ?? 0) }))
    .filter((l) => l.hours > 0);

  if (safeLessons.length === 0) {
    return { schedule: [], end_date: null };
  }

  let cursor = normalizeStartDate(startDateStr);

  let lessonIdx = 0;
  let remainingLessonHours = safeLessons[0].hours;

  const schedule = [];
  let lastTrainingDate = null;

  const MAX_CHUNK_DAYS = 366;

  while (lessonIdx < safeLessons.length) {
    const chunkStart = new Date(cursor);
    const chunkEnd = new Date(chunkStart);
    chunkEnd.setDate(chunkEnd.getDate() + (MAX_CHUNK_DAYS - 1));

    const codes = await calendar.period({ start: chunkStart, end: chunkEnd });
    if (!Array.isArray(codes) || codes.length === 0) {
      throw new Error('calendar.period returned empty period');
    }

    for (let i = 0; i < codes.length; i++) {
      if (lessonIdx >= safeLessons.length) break;

      // учебный день (не праздник)
      if (!WORK_CODES.has(codes[i])) continue;

      const day = new Date(chunkStart);
      day.setDate(day.getDate() + i);

      const take = Math.min(WORK_DAY_HOURS, remainingLessonHours);

      schedule.push({
        lesson_date: toYMD(day),
        lesson_hours: take,
        course_lesson_name: safeLessons[lessonIdx].name,
      });

      lastTrainingDate = day;
      remainingLessonHours -= take;

      if (remainingLessonHours <= 0) {
        lessonIdx += 1;
        remainingLessonHours = safeLessons[lessonIdx]?.hours ?? 0;
      }
    }

    cursor = new Date(chunkEnd);
    cursor.setDate(cursor.getDate() + 1);
  }

  // end_date = следующий день после последнего занятия (как ты делал)
  const endDate = lastTrainingDate ? new Date(lastTrainingDate) : null;
  if (endDate) endDate.setDate(endDate.getDate() + 1);

  return {
    schedule,
    end_date: endDate ? toYMD(endDate) : null,
  };
}

module.exports = {
  calculateScheduleByLessons,
  normalizeStartDate,
  toYMD,
};
