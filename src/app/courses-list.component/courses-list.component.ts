import { Component, inject, Inject, OnDestroy, OnInit } from '@angular/core';
import { Course } from '../types/Courses/Course-type';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CoursesService } from '../services/courses/courses.service';
import { CourseCreateDTO } from '../types/Courses/Course-createDTO';
import { FormsModule, NgForm, NgModel, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-courses-list.component',
  imports: [CommonModule, FormsModule],
  templateUrl: './courses-list.component.html',
  styleUrl: './courses-list.component.css',
})
export class CoursesListComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private coursesSerivce = inject(CoursesService);
  isCreating = false;
  search = '';
  courses: Course[] = [];

  newCourse: {
    name: string;
    conclusion?: string | null;
    mark?: string | null;
    description?: string | null;
  } = this.clearCourse();

  
  ngOnInit(): void {
    this.loadCourses();
  }

  ngOnDestroy(): void {
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
      },
      error: (error) => {
        console.error(error);
      }
    })
  }

  // закрыть форму без сохранения
  onCancelCreate(): void {
    this.isCreating = false;
    this.newCourse = this.clearCourse();
  }

  

  onCreate(): void {
    this.isCreating = true;
    this.newCourse = this.clearCourse();
  }

  goToEdit(course_id: number): void {
    this.router.navigate([`/courses/${course_id}/edit`]);
  }

  // сохранить новый курс
  onSave(form: NgForm): void {
    if (form.invalid) {
      return;
    }
    this.coursesSerivce.createCourse(this.newCourse).subscribe({
      next: (data) => {
        this.loadCourses();
        console.log(this.newCourse);
        this.newCourse = this.clearCourse();
      },
      error: (error) => {
        console.error('Ошибка при создании курса', error);
      }
    });
    
    this.isCreating = false;
  }

  private clearCourse(): CourseCreateDTO {
    return { name: '', conclusion: null, mark: null, description: null};
  }

  private getMaxId(): number {
    return this.courses.reduce((max, course) => course.id > max ? course.id : max, 0);
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
