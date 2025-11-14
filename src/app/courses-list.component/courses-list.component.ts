import { Component, inject, Inject, OnDestroy, OnInit } from '@angular/core';
import { Course } from '../types/Courses/Course-type';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CoursesService } from '../services/courses/courses.service';

@Component({
  selector: 'app-courses-list.component',
  imports: [CommonModule],
  templateUrl: './courses-list.component.html',
  styleUrl: './courses-list.component.css',
})
export class CoursesListComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private coursesSerivce = inject(CoursesService);
  search = '';
  courses: Course[] = [];

  ngOnDestroy(): void {

    console.log(this.courses);
  }
  ngOnInit(): void {
    this.loadCourses();
  }


  private loadCoursesMock(): void {
    this.courses = [
    { id: 1, name: 'Пожарная безопасность', hours: 40 },
    { id: 2, name: 'Разряд сварщика', hours: 40 },
    { id: 3, name: 'Первая помощь', hours: 40 },
  ]
  }

  private loadCourses(): void {
    this.coursesSerivce.getCourses().subscribe({
      next: (data) => {
        this.courses = data;
        console.log(data);
      },
      error: (error) => {
        console.error(console.error());
      }
    })
  }

  onEdit(course: any): void {

  }
  onCreate(): void {

  }
  onSearchChange(course: any): void {

  }

  navigateToEmployees(): void {
    this.router.navigate(['/']);
  }
}
