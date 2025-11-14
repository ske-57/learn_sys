import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Course } from '../types/Courses/Course-type';
import { CoursesService } from '../services/courses/courses.service';
import { Lesson } from '../types/Courses/Lesson-type';

@Component({
  selector: 'app-course-edit.component',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './course-edit.component.html',
  styleUrl: './course-edit.component.css',
})
export class CourseEditComponent implements OnInit, OnDestroy{
  private router = inject(Router)
  private coursesService = inject(CoursesService)
  private route = inject(ActivatedRoute)
  lessons: Lesson[] = []
  courseId: number = -1;
  course: Course = {
    id: null!,
    name: '',
  }

  ngOnDestroy(): void {
    
  }
  
  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const stirngId = params.get('id')
      var id = -1;
      if (stirngId != null) id = +stirngId;
      else id = -1;
      this.loadCurrCourse(id);
    })
  }

  private loadCurrCourse(course_id: number): void {
    if (course_id == -1) {
      this.course = {
        id: -1,
        name: "Something went wrong :(",
      }
    }
    else {
      this.coursesService.getCourseById(course_id).subscribe({
        next: (data : Course) => {
          this.course = data;
          this.lessons = data.lessons || [];
          console.log(data);
        },
        error: (error) => {
          console.error(console.error());
        }
      })
    }
  }


  navigateToEmployeesList(): void {
    this.router.navigate(['/']);
  }

  navigateToCoursesList(): void {
    this.router.navigate(['/courses']);
  }
}
