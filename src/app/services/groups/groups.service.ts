import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Group } from '../../types/Groups/Group-type';
import { GroupWithDetails } from '../../types/Groups/GroupWithDetails-type';
import { GroupCreateDTO } from '../../types/Groups/Group-createDTO';
import { GroupMember } from '../../types/Groups/Group-members-type';

@Injectable({
  providedIn: 'root',
})
export class GroupsService {

  private baseApi = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getGroups(): Observable<GroupWithDetails[]> {
    return this.http.get<GroupWithDetails[]>(`${this.baseApi}/groups`);
  }

  getGroupMembers(group_id: number): Observable<GroupMember[]> {
    return this.http.get<GroupMember[]>(`${this.baseApi}/groups/${group_id}/members`);
  }

  createGroup(body: GroupCreateDTO): Observable<Group> {
    return this.http.post<Group>(`${this.baseApi}/groups`, body);
  }

  addEmployeeToGroup(group_id: number, employee_id: number): Observable<void> {
    return this.http.post<void>(`${this.baseApi}/groups/${group_id}/members`, { employee_id });
  }
}
