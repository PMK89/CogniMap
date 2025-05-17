/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { MinimapService } from './minimap.service';

describe('Service: Minimap', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MinimapService]
    });
  });

  it('should ...', inject([MinimapService], (service: MinimapService) => {
    expect(service).toBeTruthy();
  }));
});
