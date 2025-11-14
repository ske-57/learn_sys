import { Lesson } from "./Lesson-type";

export type Course = {
  id: number;
  name: string;
  hours?: number | null;
  mark?: string | null;
  lessons?: Lesson[];
}