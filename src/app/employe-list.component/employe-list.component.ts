import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Employe, EmployeesService } from '../services/employees/employees.service';

@Component({
  selector: 'app-employe-list.component',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './employe-list.component.html',
  styleUrl: './employe-list.component.css',
})
export class EmployeListComponent implements OnInit, OnDestroy {
  employees: Employe[] = [];
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
        organization: 'T-bank',
        id: 1,
        snils: null,
        birthday_date: null,
        grade: null,
        phone: null,
        email: null,
        is_active: false
      },
      {
        name: 'Azazin2',
        last_name: 'Creed',
        middle_name: 'Creedovich',
        organization: 'Alfa',
        id: 2,
        snils: null,
        birthday_date: null,
        grade: null,
        phone: null,
        email: null,
        is_active: false
      },
      {
        name: 'Azazin3',
        last_name: 'Creed',
        middle_name: 'Creedovich',
        organization: 'Sber',
        id: 3,
        snils: null,
        birthday_date: null,
        grade: null,
        phone: null,
        email: null,
        is_active: false
      }
    ]
  }

  private loadEmployees(): void {

    this.employeService.getEmployees().subscribe({
      next: (data) => {
        this.employees = data;
        console.log(data);
        console.log(this.employeService.baseApi);
      },
      error: (error) => {
        console.error(error);
      }
    })

  }

}
