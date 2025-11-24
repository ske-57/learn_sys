import { CommonModule } from '@angular/common';
import { Component, Host, inject, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Course } from '../types/Courses/Course-type';
import { CoursesService } from '../services/courses/courses.service';
import { Lesson } from '../types/Courses/Lesson-type';
import { LessonCreateDTO } from '../types/Courses/Lesson-createDTO';

@Component({
  selector: 'app-course-edit.component',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './course-edit.component.html',
  styleUrl: './course-edit.component.css',
})
export class CourseEditComponent implements OnInit, OnDestroy {
  private router = inject(Router)
  private coursesService = inject(CoursesService)
  private route = inject(ActivatedRoute)
  lessons: Lesson[] = []
  courseId: number = -1;
  course: Course = {
    id: null!,
    name: '',
  }
  showAddLesson = false;
  newLesson: LessonCreateDTO = { name: '', hours: null! };

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const stirngId = params.get('id')
      var id = -1;
      if (stirngId != null) id = +stirngId;
      else id = -1;
      this.loadCurrCourse(id);
      
      // Load Curr Course Lesson - Method For Java Backend!
      this.loadCurrCourseLessons(id);
    })
  }

  // If Node.js Back is using
  private loadCurrCourse(course_id: number): void {
    if (course_id == -1) {
      this.course = {
        id: -1,
        name: "Something went wrong :(",
      }
    }
    else {
      this.coursesService.getCourseById(course_id).subscribe({
        next: (data: Course) => {
          this.course = data;
          this.lessons = data.lessons || [];
          this.courseId = course_id;
        },
        error: (error) => {
          console.error(error);
        }
      })
    }
  }


  // If Java Back is using!
  private loadCurrCourseLessons(course_id: number): void {
    if (course_id == -1) {
      this.course = {
        id: -1,
        name: "Something went wrong :(",
      }
    }
    else {
      this.coursesService.getCourseLessonsByCourseId(course_id).subscribe({
        next: (data) => this.lessons = data,
        error: (error) => console.error(error)
      })
    }
  }



  toggleAddLesson(): void {
    this.showAddLesson = !this.showAddLesson;
    if (!this.showAddLesson) this.newLesson = { name: '', hours: null! };
  }

  saveLesson(): void {
    if (!this.newLesson.name || this.newLesson.name.trim() === '') {
      console.error(`Name cant be empty ${this.newLesson.name}`);
      return;
    }
    if (!this.newLesson.hours || this.newLesson.hours < 0) {
      console.error(`Hours cant be less than zero or empty ${this.newLesson.hours}`);
      return;
    }
    this.coursesService.addLesson(this.courseId, this.newLesson).subscribe({
      next: (data) => {
        this.toggleAddLesson();
        this.loadCurrCourse(this.courseId);
        // this.loadCurrCourseLessons(this.courseId)
      },
      error: (err) => console.error('Failed to add lesson', err)
    })
  }

  cancelAdd(): void {
    this.toggleAddLesson();
  }

  // Can be deleted
  saveAll(): void {
    this.navigateToCourses();
  }

  navigateToEmployees(): void {
    this.router.navigate(['/']);
  }

  navigateToCourses(): void {
    this.router.navigate(['/courses']);
  }

  navigateToGroups(): void {
    this.router.navigate(['/groups']);
  }

  navigateToDocs(): void {
    this.router.navigate(['/docs']);
  }
}
