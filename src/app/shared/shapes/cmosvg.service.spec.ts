/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { CmosvgService } from './cmosvg.service';

describe('Service: Cmosvg', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CmosvgService]
    });
  });

  it('should ...', inject([CmosvgService], (service: CmosvgService) => {
    expect(service).toBeTruthy();
  }));
});
