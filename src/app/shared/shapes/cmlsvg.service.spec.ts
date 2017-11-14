/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { CmlsvgService } from './cmlsvg.service';

describe('Service: Cmlsvg', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CmlsvgService]
    });
  });

  it('should ...', inject([CmlsvgService], (service: CmlsvgService) => {
    expect(service).toBeTruthy();
  }));
});
