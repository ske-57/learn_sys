import { Routes } from '@angular/router';
import { EmployeListComponent } from './employe-list.component/employe-list.component';
import { EmployeeCreateComponent } from './employee-create.component/employee-create.component';

export const routes: Routes = [
    { path: '', component: EmployeListComponent, pathMatch: 'full' },
    { path: 'create-employee', component: EmployeeCreateComponent }
];
