import { Routes } from '@angular/router';
import { EmployeListComponent } from './employe-list.component/employe-list.component';
import { EmployeeCreateComponent } from './employee-create.component/employee-create.component';
import { CoursesListComponent } from './courses-list.component/courses-list.component';

export const routes: Routes = [
    { path: '', component: EmployeListComponent, pathMatch: 'full' },
    { path: 'create-employee', component: EmployeeCreateComponent },
    { path: 'courses', component: CoursesListComponent},
];
