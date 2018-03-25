/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { MnemoService } from './mnemo.service';

describe('Service: Mnemo', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MnemoService]
    });
  });

  it('should ...', inject([MnemoService], (service: MnemoService) => {
    expect(service).toBeTruthy();
  }));
});
