/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { SnapsvgService } from './snapsvg.service';

describe('Service: Snapsvg', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SnapsvgService]
    });
  });

  it('should ...', inject([SnapsvgService], (service: SnapsvgService) => {
    expect(service).toBeTruthy();
  }));
});
