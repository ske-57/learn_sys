import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Employee } from '../types/Employee/Employee-type';
import { EmployeesService } from '../services/employees/employees.service';
import { EmployeeSimpleDTO } from '../types/Employee/Employee-simpleDTO';
import { GroupMember } from '../types/Groups/Group-members-type';
import { GroupsService } from '../services/groups/groups.service';
import { CoursesService } from '../services/courses/courses.service';

@Component({
  selector: 'app-groups-edit.component',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './groups-edit.component.html',
  styleUrl: './groups-edit.component.css',
})
export class GroupsEditComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private employeesService = inject(EmployeesService);
  private groupsService = inject(GroupsService);
  private coursesService = inject(CoursesService);
  groupId: number = -1;
  group: any = null;
  showAddMember: boolean = false;
  showAddMemberManual: boolean = false;
  group_members: GroupMember[] = [];
  employees: Employee[] = [];
  organizations: {id: number, name: string}[] = [];
  courses: any[] = [];

  // saving states for group fields
  fieldSaving: { course_id: boolean; start_date: boolean; end_date: boolean } = { course_id: false, start_date: false, end_date: false };

  newMember: Employee = {
    id: null!,
    name: '',
    last_name: '',
    organization_id: null!,
    education: '',
    is_active: true
  }

  manualMember: any = {
    name: '',
    last_name: '',
    middle_name: '',
    organization_id: null,
    education: '',
    is_active: true
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const stringId = params.get('id');
      if (stringId != null) this.groupId = +stringId;
      // Load group data by id
      if (this.groupId && this.groupId > 0) {
        this.loadGroupInfo(this.groupId);
        this.getMembers();
      }
    });

    this.employeesService.getEmployees().subscribe({
      next: (list) => {
        this.employees = list
      },
      error: (err) => {
        console.error('Failed to load employees', err)
      }
    });

    // Load organizations for manual creation
    this.employeesService.getOrganizations().subscribe({
      next: (list) => {
        this.organizations = list;
      },
      error: (err) => {
        console.error('Failed to load organizations', err);
      }
    });

    // Load courses to allow selecting by name
    this.coursesService.getCourses().subscribe({
      next: (list) => this.courses = list,
      error: (err) => console.error('Failed to load courses', err)
    });
  }

  removeMember(memberId: number): void {
    this.groupsService.deleteGroupMember(this.groupId, memberId).subscribe({
      next: (data) => {
        console.log(data);
        this.getMembers();
      },
      error: (err) => {
        console.error(err);
      }
    })
  }

  toggleAddMember(): void {
    this.showAddMember = !this.showAddMember;
    if (this.showAddMember) {
      this.showAddMemberManual = false;
    }
  }

  toggleAddMemberManual(): void {
    this.showAddMemberManual = !this.showAddMemberManual;
    if (this.showAddMemberManual) {
      this.showAddMember = false;
    }
  }

  saveMember(): void {
    // Logic to save new member to group (existing employee)
    this.groupsService.addEmployeeToGroup(this.groupId, this.newMember.id!).subscribe({
      next: (data) => {
        // Optionally refresh the member list
        this.showAddMember = false;
        this.getMembers()
      },
      error: (error) => {
        console.error('Error adding member to group', error);
      }
    });
  }

  saveMemberManual(): void {
    // Create employee then add to group
    this.employeesService.createEmployee(this.manualMember).subscribe({
      next: (created: any) => {
        const createdId = created?.id;
        if (!createdId) {
          console.error('Created employee id missing', created);
          return;
        }
        this.groupsService.addEmployeeToGroup(this.groupId, createdId).subscribe({
          next: () => {
            this.showAddMemberManual = false;
            this.manualMember = { name: '', last_name: '', middle_name: '', organization_id: null, education: '', is_active: true };
            this.getMembers();
          },
          error: (err) => {
            console.error('Error adding created employee to group', err);
          }
        });
      },
      error: (err) => {
        console.error('Failed to create employee', err);
      }
    });
  }

  cancelAddManual(): void {
    this.showAddMemberManual = false;
  }

  getMembers(): void {
    this.groupsService.getGroupMembers(this.groupId).subscribe({
          next: (members) => {
            this.group_members = members;
          },
          error: (err) => {
            console.error('Failed to load group members', err);
          }
        });
  }

  loadGroupInfo(groupId: number): void {
    this.groupsService.getGroupInfo(groupId).subscribe({
      next: (data) => {
        this.group = data;
      },
      error: (err) => {
        console.error('Failed to load group info', err);
      }
    });
  }

  cancelAdd(): void {
    this.showAddMember = false;
  }

  saveField(field: 'course_id' | 'start_date' | 'end_date'): void {
    if (this.groupId === -1 || !this.group) return;
    this.fieldSaving[field] = true as any;
    const body: any = {};
    body[field] = (this.group as any)[field] ?? null;
    this.groupsService.updateGroup(this.groupId, body).subscribe({
      next: (updated) => {
        console.log(`${field} updated`);
        this.group = updated;
        this.fieldSaving[field] = false as any;
      },
      error: (err) => {
        console.error(`Failed to update ${field}`, err);
        this.fieldSaving[field] = false as any;
        alert(`Не удалось сохранить ${field}`);
      }
    });
  }

  saveAll(): void {
    // Logic to save all changes
    // Save current group fields (course_id, start_date, end_date) in one call
    if (!this.group || this.groupId === -1) { this.navigateToGroups(); return; }

    const payload: any = {
      course_id: this.group.course_id ?? null,
      start_date: this.group.start_date ?? null,
      end_date: this.group.end_date ?? null,
    };

    this.groupsService.updateGroup(this.groupId, payload).subscribe({
      next: (updated) => {
        alert('Группа сохранена');
        this.navigateToGroups();
      },
      error: (err) => {
        console.error('Failed to update group', err);
        alert('Не удалось сохранить группу');
      }
    });
  }

  navigateToEmployees(): void {
    // Логика навигации к списку сотрудников
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
