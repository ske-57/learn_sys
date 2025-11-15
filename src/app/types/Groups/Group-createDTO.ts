export type GroupCreateDTO = {
  id: number;
  course_id: number | null;
  start_date: string;          // 'YYYY-MM-DD'
  end_date: string | null;     // можно null, если дата не задана
}