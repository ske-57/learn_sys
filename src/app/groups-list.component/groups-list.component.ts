import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';

import { GroupsService } from '../services/groups/groups.service';
import { GroupWithDetails } from '../types/Groups/GroupWithDetails-type';

import { CoursesService } from '../services/courses/courses.service';
import { Course } from '../types/Courses/Course-type';
import { GroupCreateDTO } from '../types/Groups/Group-createDTO';

@Component({
  selector: 'app-groups-list.component',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './groups-list.component.html',
  styleUrl: './groups-list.component.css',
})
export class GroupsListComponent implements OnInit {
  private router = inject(Router);
  private groupsService = inject(GroupsService);
  private coursesService = inject(CoursesService);

  groups: GroupWithDetails[] = [];
  courses: Course[] = [];

  isCreating = false;

  filters = {
    search: '',
  };

  newGroup: GroupCreateDTO = this.clearGroup();

  ngOnInit(): void {
    this.loadGroups();
    this.loadCourses();
  }

  private loadGroups(): void {
    this.groupsService.getGroups().subscribe({
      next: (data: GroupWithDetails[]) => {
        this.groups = data;
      },
      error: (error) => {
        console.error('Ошибка при загрузке групп', error);
      },
    });
  }

  private loadCourses(): void {
    this.coursesService.getCourses().subscribe({
      next: (data: Course[]) => {
        this.courses = data;
      },
      error: (error) => {
        console.error('Ошибка при загрузке курсов', error);
      },
    });
  }

  onCreate(): void {
    this.isCreating = true;
    this.newGroup = this.clearGroup();
  }

  onCancelCreate(): void {
    this.isCreating = false;
    this.newGroup = this.clearGroup();
  }

  onSave(form: NgForm): void {
    if (form.invalid) {
      alert('Вам нужно обяхательно ввести номер группы, курс обучения и дату начала или конца');
      return;
    }

    // this.newGroup.end_date = this.newGroup.start_date // временно, пока нет поля ввода (add 10 days)

    this.groupsService.createGroup(this.newGroup).subscribe({
      next: () => {
        this.newGroup = this.clearGroup();
        this.isCreating = false;
        this.loadGroups();
      },
      error: (err) => {
        if (err.status === 409) {
          console.error(err.error.error);
          alert('Группа с таким номером уже существует');
        }
        else console.error('Ошибка при создании группы', err);
      },
    });
  }

  private clearGroup(): GroupCreateDTO {
    return {
      id: null!,
      course_id: null,
      start_date: '',
      end_date: null,
    };
  }

  editGroup(groupId: number): void {
    this.router.navigate([`/groups/${groupId}/edit`]);
  }

  navigateToCourses(): void {
    this.router.navigate(['/courses']);
  }

  navigateToEmployees(): void {
    this.router.navigate(['/employees']);
  }

  navigateToGroups(): void {
    // Логика навигации к списку групп
    this.router.navigate(['/groups']);
  }

  navigateToDocs(): void {
    this.router.navigate(['/docs']);
  }
}
