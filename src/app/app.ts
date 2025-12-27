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
    this.http.get('https://d5dtikhpg3nokckhah7v.zj2i1qoy.apigw.yandexcloud.net/health')
      .subscribe({ next: () => {}, error: () => {} });
  }
}
