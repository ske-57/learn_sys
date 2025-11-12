import { Routes } from '@angular/router';
import { EmployeListComponent } from './employe-list.component/employe-list.component';

export const routes: Routes = [
    { path: '', component: EmployeListComponent, pathMatch: 'full' },
];
