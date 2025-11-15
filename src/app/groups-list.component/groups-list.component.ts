import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { GroupsService } from '../services/groups/groups.service';
import { GroupWithDetails } from '../types/Groups/GroupWithDetails-type';


@Component({
  selector: 'app-groups-list.component',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './groups-list.component.html',
  styleUrl: './groups-list.component.css',
})
export class GroupsListComponent {
  private router = inject(Router);
  private groupsService = inject(GroupsService);
  groups: GroupWithDetails[] = [];
  filters = {
    search: '',
  };

  ngOnInit(): void {
    this.loadGroups();
  }

  private loadGroupsMock(): void {
    this.groups = [
      { id: 1, start_date: '2023-01-01', end_date: '2023-06-01', course_id: 1, course_name:'Defend' },
      { id: 2, start_date: '2023-02-01', end_date: '2023-07-01', course_id: 2, course_name:'Attack' },
      { id: 3, start_date: '2023-03-01', end_date: '2023-08-01', course_id: 3, course_name:'Secure' },
    ];
  }

  private loadGroups(): void {
    this.groupsService.getGroups().subscribe({
      next: (data: GroupWithDetails[]) => {
        this.groups = data;
      },
      error: (error) => {
        console.error('Ошибка при загрузке групп', error);
      }
    });
  }

  createGroup(): void {
    // Логика создания группы
    console.log('Создание группы');
  }

  editGroup(groupId: number): void {
    // Логика редактирования группы
    console.log('Редактирование группы с ID:', groupId);
  }


  navigateToCoursesList(): void {
    // Логика навигации к списку курсов
    this.router.navigate(['/courses']);
  }

  navigateToEmployeesList(): void {
    // Логика навигации к списку сотрудников
    this.router.navigate(['/employees']);
  }

  navigateToGroups(): void {
    // Логика навигации к списку групп
    this.router.navigate(['/groups']);
  }
}
