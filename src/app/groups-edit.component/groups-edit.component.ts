import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Employee } from '../types/Employee/Employee-type';
import { EmployeesService } from '../services/employees/employees.service';
import { EmployeeSimpleDTO } from '../types/Employee/Employee-simpleDTO';
import { GroupMember } from '../types/Groups/Group-members-type';
import { GroupsService } from '../services/groups/groups.service';

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
  groupId: number = -1;
  showAddMember: boolean = false;
  group_members: GroupMember[] = [];
  employees: EmployeeSimpleDTO[] = [];
  newMember: Employee = {
    id: null!,
    name: '',
    last_name: '',
    organization_id: null!,
    education: '',
    is_active: true
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const stringId = params.get('id');
      if (stringId != null) this.groupId = +stringId;
      // Load group data by id if needed
    });

    this.groupsService.getGroupMembers(this.groupId).subscribe({
      next: (members) => {
        this.group_members = members;
      },
      error: (err) => {
        console.error('Failed to load group members', err);
      }
    });

    this.employeesService.getSimpleEmployees().subscribe({
      next: (list) => {
        this.employees = list
      },
      error: (err) => {
        console.error('Failed to load employees', err)
      }
    });
  }

  removeMember(memberId: number): void {
    // Logic to remove member from group
    console.log(`Removing member with ID: ${memberId} from group ID: ${this.groupId}`);
  }

  toggleAddMember(): void {
    this.showAddMember = !this.showAddMember;
  }

  saveMember(): void {
    // Logic to save new member to group
    this.groupsService.addEmployeeToGroup(this.groupId, this.newMember.id!).subscribe({
      next: (data) => {
        // Optionally refresh the member list
        this.groupsService.getGroupMembers(this.groupId).subscribe({
          next: (members) => {
            this.group_members = members;
          },
          error: (err) => {
            console.error('Failed to load group members', err);
          }
        });
        this.showAddMember = false;
      },
      error: (error) => {
        console.error('Error adding member to group', error);
      }
    });
  }

  cancelAdd(): void {
    this.showAddMember = false;
  }

  saveAll(): void {
    // Logic to save all changes
    this.navigateToGroups();
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
}
