import { TestBed } from '@angular/core/testing';

import { XyzService } from './xyz.service';

describe('XyzService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: XyzService = TestBed.get(XyzService);
    expect(service).toBeTruthy();
  });
});
