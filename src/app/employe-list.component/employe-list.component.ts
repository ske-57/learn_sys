import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { EmployeeWithOrg, EmployeesService } from '../services/employees/employees.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-employe-list.component',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './employe-list.component.html',
  styleUrl: './employe-list.component.css',
})
export class EmployeListComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  employees: EmployeeWithOrg[] = [];
  private employeService = inject(EmployeesService);


  ngOnInit(): void {
    this.loadEmployees();
  }

  ngOnDestroy(): void {
    this.employees = [];
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
  }

  private loadEmployees(): void {

    this.employeService.getEmployees().subscribe({
      next: (data) => {
        this.employees = data;
        console.log(data);
        console.log(this.employeService.fileName);
      },
      error: (error) => {
        console.error(error);
      }
    })

  }

  navigateToEmployeeCreate(): void {
    // Логика навигации к компоненту создания сотрудника
    this.router.navigate(['/create-employee']);
  }

}
