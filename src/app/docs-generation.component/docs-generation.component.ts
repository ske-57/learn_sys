import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { GroupsService } from '../services/groups/groups.service';
import { Group } from '../types/Groups/Group-type';
import { GroupWithDetails } from '../types/Groups/GroupWithDetails-type';
import { OrganizationsService } from '../services/organizations/organizations.service';

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
  private organizationsService = inject(OrganizationsService);
  groups: GroupWithDetails[] = [];
  organizations: {id : number, name: string}[] = [];
  params: any = {

  }

  ngOnInit(): void {
    console.log('Docs Generation Component initialized');
    this.organizationsService.getOrganizations().subscribe({
      next: (data) => {
        this.organizations = data;
      },
      error: (error) => {
        console.error('Error loading organizations', error);
      }
    });

    this.groupsService.getGroups().subscribe({
      next: (data: GroupWithDetails[]) => {
        this.groups = data;
      },
      error: (error) => {
        console.error('Ошибка при загрузке групп', error);
      },
    });
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
