import { HttpClient } from '@angular/common/http';
import { Component, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('system_frontend');

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get('https://158.160.95.86.sslip.io/health')
      .subscribe({ next: () => {}, error: () => {} });
  }
}
