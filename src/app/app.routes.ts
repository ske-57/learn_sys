import { Routes } from '@angular/router';
import { EmployeListComponent } from './employee-list.component/employe-list.component';
import { EmployeeCreateComponent } from './employee-create.component/employee-create.component';
import { CoursesListComponent } from './courses-list.component/courses-list.component';
import { CourseEditComponent } from './course-edit.component/course-edit.component';
import { GroupsListComponent } from './groups-list.component/groups-list.component';
import { GroupsEditComponent } from './groups-edit.component/groups-edit.component';
import { DocsGenerationComponent } from './docs-generation.component/docs-generation.component';

export const routes: Routes = [
    { path: '', component: EmployeListComponent, pathMatch: 'full' },
    { path: 'create-employee', component: EmployeeCreateComponent },
    { path: 'courses', component: CoursesListComponent},
    { path: 'courses/:id/edit', component: CourseEditComponent},
    { path: 'groups', component: GroupsListComponent},
    { path: 'groups/:id/edit', component: GroupsEditComponent},
    { path: 'docs', component: DocsGenerationComponent},
    { path: '**', redirectTo: '' }
];
