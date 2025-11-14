import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Course } from '../../types/Courses/Course-type';
import { Lesson } from '../../types/Courses/Lesson-type';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

export type CourseWithLessons = Course & Lesson[];

@Injectable({
  providedIn: 'root',
})
export class CoursesService {

  private baseApi = environment.apiUrl;

  constructor(private http: HttpClient) { };


  getCourses(): Observable<Course[]> {
    return this.http.get<Course[]>(`${this.baseApi}/courses`);
  }

  getCourseById(course_id: number): Observable<Course> {
    return this.http.get<Course>(`${this.baseApi}/courses/${course_id}`);
  }
    
}
