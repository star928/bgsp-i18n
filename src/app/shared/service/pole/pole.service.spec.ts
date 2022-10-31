import { TestBed } from '@angular/core/testing';

import { PoleService } from './pole.service';

describe('PoleLogService', () => {
  let service: PoleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PoleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
