import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Course } from '../../types/Courses/Course-type';
import { Lesson } from '../../types/Courses/Lesson-type';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { LessonCreateDTO } from '../../types/Courses/Lesson-createDTO';
import { CourseCreateDTO } from '../../types/Courses/Course-createDTO';

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

  createCourse(body: CourseCreateDTO): Observable<Course> {
    return this.http.post<Course>(`${this.baseApi}/courses`, body);
  }

  getCourseById(course_id: number): Observable<Course> {
    return this.http.get<Course>(`${this.baseApi}/courses/${course_id}`);
  }
  
  addLesson(course_id: number, body: LessonCreateDTO): Observable<LessonCreateDTO> {
    return this.http.post<LessonCreateDTO>(`${this.baseApi}/courses/${course_id}/lessons`, body );
  }
    
}
