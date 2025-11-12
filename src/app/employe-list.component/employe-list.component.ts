import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';

interface Employee {
  name: string;
  last_name: string;
  middle_name: string;
  organization: string;
}

@Component({
  selector: 'app-employe-list.component',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './employe-list.component.html',
  styleUrl: './employe-list.component.css',
})
export class EmployeListComponent implements OnInit, OnDestroy {
  employees: Employee[] = [];


  ngOnInit(): void {
    this.loadEmployees();
  }

  ngOnDestroy(): void {
    this.employees = [];
  }

  loadEmployees() {
    this.employees = [
      {
        name: 'Azazin',
        last_name: 'Creed',
        middle_name: 'Creedovich',
        organization: 'Sber'
      },
      {
        name: 'Azazin2',
        last_name: 'Creed',
        middle_name: 'Creedovich',
        organization: 'Sber'
      },
      {
        name: 'Azazin3',
        last_name: 'Creed',
        middle_name: 'Creedovich',
        organization: 'Sber'
      }
    ]
  }

}
