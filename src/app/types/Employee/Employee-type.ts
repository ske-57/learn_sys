export type Employee = {
  id: number;
  name: string;
  last_name: string;
  middle_name?: string | null;
  snils?: string | null;
  birth_date?: string | null;
  organization_id: number;
  organization_name?: string;
  grade?: number | null;
  phone?: string | null;
  email?: string | null;
  education: string;
  is_active: boolean;
}