import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { EmployeeCreateDTO } from '../types/Employee/Employee-createDTO';
import { EmployeesService } from '../services/employees/employees.service';


@Component({
  selector: 'app-employee-create.component',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './employee-create.component.html',
  styleUrl: './employee-create.component.css',
})
export class EmployeeCreateComponent {
  private router = inject(Router);
  private employeeService = inject(EmployeesService);
  organizations: {id:number,name:string}[] = [];
  employee: EmployeeCreateDTO = {
    name: '',
    last_name: '',
    organization_id: null!,
    education: '',
    is_active: true
  };

  onSubmit(form: NgForm): void {
    if (form.invalid) {
      alert('Заполните обязательные поля: имя, фамилию, организацию')
      return
    };

    // здесь делаешь запрос на backend и т.п.
    this.employeeService.createEmployee(this.employee).subscribe({
      next: (data) => {
        this.navigateToEmployees();
      },
      error: (error) => {
        console.error('Ошибка при создании сотрудника', error);
      }
    });
  }

  onReset(form: NgForm): void {
    form.resetForm();
    // можно задать дефолты после reset, если надо:
    this.employee = {name: '', last_name:'', organization_id: null!, education: '', is_active: true};
  }

  loadOrganizations(): void {
    if (this.organizations.length > 0) return;
    this.employeeService.getOrganizations().subscribe({
      next: (list) => this.organizations = list,
      error: (err) => console.error('Failed to load organizations', err)
    })
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
