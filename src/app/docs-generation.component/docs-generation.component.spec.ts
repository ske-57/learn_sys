import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocsGenerationComponent } from './docs-generation.component';

describe('DocsGenerationComponent', () => {
  let component: DocsGenerationComponent;
  let fixture: ComponentFixture<DocsGenerationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocsGenerationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DocsGenerationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
