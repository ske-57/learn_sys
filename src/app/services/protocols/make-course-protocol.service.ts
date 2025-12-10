import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MakeCourseProtocolService {

  private baseApi = environment.apiUrl;

  constructor (private http: HttpClient) {}

  makeCourseProtocol(data: any): Observable<Blob> {
    return this.http.post(
      `${this.baseApi}/generate-comission-protocol`,
      data,                                            // <-- тело запроса
      {
        responseType: 'blob' as 'blob',                // <-- важный каст
      }
    );
  }

  makeIntroProtocol(data: any): Observable<Blob> {
    return this.http.post(
      `${this.baseApi}/generate-accepted-protocol`,
      data,
      {
        responseType: 'blob' as 'blob',
      }
    );
  }
}
