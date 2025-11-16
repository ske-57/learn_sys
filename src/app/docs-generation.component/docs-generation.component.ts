import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { GroupsService } from '../services/groups/groups.service';

@Component({
  selector: 'app-docs-generation.component',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './docs-generation.component.html',
  styleUrl: './docs-generation.component.css',
})
export class DocsGenerationComponent implements OnInit {

  private router = inject(Router);
  private groupsService = inject(GroupsService);
  params: any = {

  }

  ngOnInit(): void {
    console.log('Docs Generation Component initialized');
  }

  generateEntollmentProtocol(): void {
    // Логика генерации отчета
    console.log('Generating entollmentreport with params:', this.params);
  }

  generateVisitProtocol(): void {
    // Логика генерации отчета
    console.log('Generating visit report with params:', this.params);
  }
  
  generateCourseProtocol(): void {
    // Логика генерации отчета
    console.log('Generating course report with params:', this.params);
  }

  clearGroup(): void {
    this.params.groupId = null;
  }

  clearTrainingOrg(): void {
    this.params.trainingOrgId = null;
  }

  clearCustomerOrg(): void {
    this.params.customerOrgId = null;
  }

  navigateToEmployees(): void {
    this.router.navigate(['/']);
  }

  navigateToCourses(): void {
    this.router.navigate(['/courses']);
  }

  navigateToGroups(): void {
    this.router.navigate(['/groups']);
  }

}
