import { TestBed } from '@angular/core/testing';

import { MakeCourseProtocolService } from './make-course-protocol.service';

describe('MakeCourseProtocolService', () => {
  let service: MakeCourseProtocolService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MakeCourseProtocolService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
