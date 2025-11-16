import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Organization } from '../../types/Organizations/Organization-type';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class OrganizationsService {

  private baseApi = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getOrganizations(): Observable<Organization[]> {
    return this.http.get<Organization[]>(`${this.baseApi}/organizations`);
  }

  createOrganization(name: String): Observable<Organization> {
    return this.http.post<Organization>(`${this.baseApi}/organizations`, { name });
  }
  
}
