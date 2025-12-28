import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { EmployeeWithOrg, EmployeesService } from '../services/employees/employees.service';
import { Router } from '@angular/router';
import { OrganizationsService } from '../services/organizations/organizations.service';

@Component({
  selector: 'app-employe-list.component',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './employe-list.component.html',
  styleUrl: './employe-list.component.css',
})
export class EmployeListComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  employees: EmployeeWithOrg[] = [];
  displayedEmployees: EmployeeWithOrg[] = [];
  filterLastName: string = '';
  private employeService = inject(EmployeesService);
  private organizationsService = inject(OrganizationsService);

  // UI state for creating a new organization
  showOrgInput = false;
  newOrganizationName = '';

  ngOnInit(): void {
    this.loadEmployees();
  }

  ngOnDestroy(): void {
  }

  deactivateEmployee(employeeId: number): void {
    this.employeService.deactivateEmployee(employeeId).subscribe({
      next: (data) => this.loadEmployees(),
      error: (err) => console.error('Error, when deactivating employee', err)
    });
  }

  navigateToEmployeeCreate(): void {
    // Логика навигации к компоненту создания сотрудника
    this.router.navigate(['/create-employee']);
  }

  toggleOrgInput(): void {
    this.showOrgInput = !this.showOrgInput;
    if (!this.showOrgInput) {
      this.newOrganizationName = '';
    }
  }

  createNewOrganization(name?: string): void {
    const orgName = (name ?? this.newOrganizationName)?.toString().trim();
    if (!orgName) {
      alert('Введите название организации');
      return;
    }

    this.organizationsService.createOrganization(orgName).subscribe({
      next: (data) => {
        console.log('Organization created', data);
        // reset UI
        this.newOrganizationName = '';
        this.showOrgInput = false;
      },
      error: (err) =>{
        console.error('Error, when creating organization', err);
        alert('Ошибка при создании организации');
      }
    });
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

  private loadEmployees(): void {

    this.employeService.getEmployees().subscribe({
      next: (data) => {
        this.employees = data;
        this.displayedEmployees = data;
      },
      error: (error) => {
        console.error(error);
      }
    })

  }

  private loadEmployeesMock(): void {
    this.employees = [
      {
        name: 'Azazin',
        last_name: 'Creed',
        middle_name: 'Creedovich',
        organization_id: 1,
        organization_name: 'Org1',
        id: 1,
        snils: null,
        birth_date: null,
        grade: null,
        phone: null,
        email: null,
        education: 'MAI',
        is_active: false
      },
      {
        name: 'Azazin2',
        last_name: 'Creed',
        middle_name: 'Creedovich',
        organization_id: 2,
        organization_name: 'Org2',
        id: 2,
        snils: null,
        birth_date: null,
        grade: null,
        phone: null,
        email: null,
        education: 'MSU',
        is_active: false
      },
      {
        name: 'Azazin3',
        last_name: 'Creed',
        middle_name: 'Creedovich',
        organization_id: 3,
        organization_name: 'T-bank',
        id: 3,
        snils: null,
        birth_date: null,
        grade: null,
        phone: null,
        email: null,
        education: 'SPbPU',
        is_active: false
      }
    ]
    this.displayedEmployees = this.employees;
  }

  applyFilter(): void {
    const q = String(this.filterLastName ?? '').trim().toLowerCase();
    if (!q) {
      this.displayedEmployees = this.employees;
      return;
    }

    this.displayedEmployees = this.employees.filter(e => (e.last_name ?? '').toString().toLowerCase().includes(q));
  }
}
