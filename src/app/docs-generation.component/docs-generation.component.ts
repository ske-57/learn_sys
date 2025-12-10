import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { GroupsService } from '../services/groups/groups.service';
import { Group } from '../types/Groups/Group-type';
import { GroupWithDetails } from '../types/Groups/GroupWithDetails-type';
import { OrganizationsService } from '../services/organizations/organizations.service';
import { MakeCourseProtocolService } from '../services/protocols/make-course-protocol.service';
import { Employee } from '../types/Employee/Employee-type';
import { GroupMember } from '../types/Groups/Group-members-type';
import { Course } from '../types/Courses/Course-type';
import { CoursesService } from '../services/courses/courses.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-docs-generation.component',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './docs-generation.component.html',
  styleUrl: './docs-generation.component.css',
})
export class DocsGenerationComponent implements OnInit {

  private router = inject(Router);
  private groupsService = inject(GroupsService);
  private coursesService = inject(CoursesService);
  private organizationsService = inject(OrganizationsService);
  private makeProtocolService = inject(MakeCourseProtocolService);
  private groupMembers: GroupMember[] = [];
  private groupInfo: Group | null = null;
  private courseInfo: Course | null = null;
  reasons: any[] = [
    { id: 1, name: 'Очередная' },
    { id: 2, name: 'Внеочередная' }
  ]
  groups: GroupWithDetails[] = [];
  organizations: { id: number, name: string }[] = [];
  params: any = {

  }

  ngOnInit(): void {
    this.organizationsService.getOrganizations().subscribe({
      next: (data) => {
        this.organizations = data;
      },
      error: (error) => {
        console.error('Error loading organizations', error);
      }
    });

    this.groupsService.getGroups().subscribe({
      next: (data: GroupWithDetails[]) => {
        this.groups = data;
      },
      error: (error) => {
        console.error('Ошибка при загрузке групп', error);
      },
    });
  }

  generateVisitProtocol(): void {
    if (!this.validateParams()) return
    // Логика генерации отчета
    console.log('Generating visit with params:', this.params);
    const groupId = this.params.group;

    this.groupsService.getGroupInfo(groupId).subscribe({
      next: (group) => {
        this.groupInfo = group;

        forkJoin({
          members: this.groupsService.getGroupMembers(groupId),
          course: this.coursesService.getCourseById(this.groupInfo.course_id),
        }).subscribe({
          next: ({ members, course }) => {
            this.groupMembers = members;
            this.courseInfo = course;

            const data = this.getAllData();

            console.log("data intro = ", data);

            this.makeProtocolService.makeVisitProtocol(data).subscribe({
              next: (blob) => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'protocol_visit_result.docx';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
              },
              error: (err) => {
                console.error('Ошибка при скачивании протокола', err);
              }
            });
          },
          error: (error) => {
            console.error('Ошибка при загрузке участников или курса', error);
          },
        });
      },
      error: (error) => {
        console.error('Ошибка при загрузке данных группы', error);
      },

    })

  }

  generateAcceptedProtocol(): void {
    if (!this.validateParams()) return;

    const groupId = this.params.group;
    // Логика генерации отчета
    console.log('Generating visit report with params:', this.params);
    this.groupsService.getGroupInfo(groupId).subscribe({
      next: (group) => {
        this.groupInfo = group;

        forkJoin({
          members: this.groupsService.getGroupMembers(groupId),
          course: this.coursesService.getCourseById(this.groupInfo.course_id),
        }).subscribe({
          next: ({ members, course }) => {
            this.groupMembers = members;
            this.courseInfo = course;

            const data = this.getAllData();

            console.log("data intro = ", data);

            this.makeProtocolService.makeAcceptProtocol(data).subscribe({
              next: (blob) => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'protocol_accepted_result.docx';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
              },
              error: (err) => {
                console.error('Ошибка при скачивании протокола', err);
              }
            });
          },
          error: (error) => {
            console.error('Ошибка при загрузке участников или курса', error);
          },
        });
      },
      error: (error) => {
        console.error('Ошибка при загрузке данных группы', error);
      },
    });
  }

  generateComissionProtocol(): void {
    if (!this.validateParams()) return

    const groupId = this.params.group;

    // 1. Сначала получаем данные группы (чтобы узнать course_id)
    this.groupsService.getGroupInfo(groupId).subscribe({
      next: (group) => {
        this.groupInfo = group;

        // 2. Когда группа получена — параллельно грузим:
        //    - участников группы
        //    - данные курса по course_id
        forkJoin({
          members: this.groupsService.getGroupMembers(groupId),
          course: this.coursesService.getCourseById(this.groupInfo.course_id),
        }).subscribe({
          next: ({ members, course }) => {
            this.groupMembers = members;
            this.courseInfo = course;

            // 3. Теперь все данные на месте — собираем объект data
            const data = this.getAllData();

            console.log('Data =', data);

            // 4. Здесь уже можно дернуть бэкенд на генерацию файла
            // (если твой MakeCourseProtocolService так делает)
            this.makeProtocolService.makeComissionProtocol(data)
              .subscribe({
                next: (blob) => {
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'protocol_comission_result.docx';
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  window.URL.revokeObjectURL(url);
                },
                error: (err) => {
                  console.error('Ошибка при скачивании протокола', err);
                }
              });
          },
          error: (error) => {
            console.error('Ошибка при загрузке участников или курса', error);
          },
        });
      },
      error: (error) => {
        console.error('Ошибка при загрузке данных группы', error);
      },
    });
  }


  getAllData(): { group_id: number, course_name: string, hours: number, employee: GroupMember[] } {
    const data = {
      group_id: this.groupInfo?.id || -1,
      course_name: this.courseInfo?.name || 'Nothing',
      hours: this.courseInfo?.hours || -1,
      employee: this.groupMembers,
      start_date: this.groupInfo?.start_date,
      end_date: this.groupInfo?.end_date || -1
    }
    return data;
  }


  getAllEmployeesByGroupId(groupId: number): void {
    this.groupsService.getGroupMembers(groupId).subscribe({
      next: (data) => {
        this.groupMembers = data;
        console.log('Employees in group:', data);
      },
      error: (error) => {
        console.error('Error fetching employees for group', error);
      }
    });
  }

  getGroupData(groupId: number): void {
    this.groupsService.getGroupInfo(groupId).subscribe({
      next: (data) => {
        this.groupInfo = data;
      },
      error: (error) => {
        console.error(error);
      }
    })
  }

  getCourseData(courseId: number): void {
    this.coursesService.getCourseById(courseId).subscribe({
      next: (data) => {
        this.courseInfo = data;
      },
      error: (error) => {
        console.error(error);
      }
    })
  }

  validateParams(): boolean {
    if (!this.params.group) {
      console.error('Group parameter is required to generate course report');
      alert('Выберите группу');
      return false;
    }
    if (!this.params.trainingOrg) {
      console.error('Training Organization parameter is required to generate course report');
      alert('Выберите обучающуюю организацию');
      return false;
    }
    return true;
  }

  clearGroup(): void {
    this.params.group = null!;
  }

  clearTrainingOrg(): void {
    this.params.trainingOrg = null!;
  }

  clearCustomerOrg(): void {
    this.params.customerOrg = null!;
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

}
