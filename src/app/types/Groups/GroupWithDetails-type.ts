import { Group } from "./Group-type";

export type GroupWithDetails = Group & { 
  course_name: string, 
  organization_name?: string
};