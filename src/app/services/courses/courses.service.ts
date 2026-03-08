import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Course } from '../../types/Courses/Course-type';
import { Lesson } from '../../types/Courses/Lesson-type';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { LessonCreateDTO } from '../../types/Courses/Lesson-createDTO';
import { CourseCreateDTO } from '../../types/Courses/Course-createDTO';

@Injectable({
  providedIn: 'root',
})
export class CoursesService {

  private baseApi = environment.apiUrl;

  constructor(private http: HttpClient) { };


  getCourses(): Observable<Course[]> {
    return this.http.get<Course[]>(`${this.baseApi}/courses`);
  }

  createCourse(body: CourseCreateDTO): Observable<Course> {
    return this.http.post<Course>(`${this.baseApi}/courses`, body);
  }

  getCourseById(course_id: number): Observable<Course> {
    return this.http.get<Course>(`${this.baseApi}/courses/${course_id}`);
  }

  /**
   * Partial update of a course (mark/conclusion etc.)
   */
  updateCourse(course_id: number, body: Partial<Course>): Observable<Course> {
    return this.http.patch<Course>(`${this.baseApi}/courses/${course_id}`, body);
  }

  // Only java endpoint
  getCourseLessonsByCourseId(course_id: number): Observable<Lesson[]> {
    return this.http.get<Lesson[]>(`${this.baseApi}/courses/${course_id}/lessons`);
  }
  
  addLesson(course_id: number, body: LessonCreateDTO): Observable<LessonCreateDTO> {
    return this.http.post<LessonCreateDTO>(`${this.baseApi}/courses/${course_id}/lessons`, body );
  }

  deleteLesson(course_id: number, lesson_id: number): Observable<any> {
    return this.http.delete(`${this.baseApi}/courses/${course_id}/lessons/${lesson_id}`);
  }

  updateLesson(course_id: number, lesson_id: number, body: { name: string; hours: number }): Observable<Lesson> {
    return this.http.patch<Lesson>(`${this.baseApi}/courses/${course_id}/lessons/${lesson_id}`, body);
  }
    
}
