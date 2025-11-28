import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { Employee } from '../../types/Employee/Employee-type';
import { EmployeeCreateDTO } from '../../types/Employee/Employee-createDTO';
import { EmployeeSimpleDTO } from '../../types/Employee/Employee-simpleDTO';

export type EmployeeWithOrg = Employee & { organization_name: string};

@Injectable({
  providedIn: 'root',
})
export class EmployeesService {

  private baseApi = environment.apiUrl;

  constructor(private http: HttpClient) { }


  getEmployees(): Observable<EmployeeWithOrg[]> {
    return this.http.get<EmployeeWithOrg[]>(`${this.baseApi}/employees`);
  }

  getSimpleEmployees(): Observable<EmployeeSimpleDTO[]> {
    return this.http.get<EmployeeSimpleDTO[]>(`${this.baseApi}/employees/simple`);
  }

  createEmployee(body: EmployeeCreateDTO): Observable<EmployeeCreateDTO> {
    return this.http.post<EmployeeCreateDTO>(`${this.baseApi}/employees`, body);
  }

  getOrganizations(): Observable<{id: number, name: string}[]> {
    return this.http.get<{id: number, name: string}[]>(`${this.baseApi}/organizations`);
  }

  deactivateEmployee(employeeId: number): Observable<Employee> {
    return this.http.post<Employee>(`${this.baseApi}/employees/${employeeId}/deactivate`, null);
  }

}
