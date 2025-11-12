import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.dev';
import { Observable } from 'rxjs';

export type Employe = {
  id: number;
  name: string;
  last_name: string;
  middle_name: string;
  snils: string | null;
  birthday_date: string | null;  // ISO-date, если приходит из БД/JSON
  organization: string;
  grade: number | null;
  phone: string | null;
  email: string | null;
  is_active: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class EmployeesService {

  baseApi = environment.apiUrl;

  constructor(private http: HttpClient) { }


  getEmployees(): Observable<Employe[]> {
    return this.http.get<Employe[]>(`${this.baseApi}/employees`);
  }

  createEmploye(body: Employe): Observable<Employe> {
    return this.http.post<Employe>(`${this.baseApi}/employees`, body);
  }

}
