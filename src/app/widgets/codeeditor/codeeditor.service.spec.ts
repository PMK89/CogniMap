/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { CodeeditorService } from './codeeditor.service';

describe('Service: Codeeditor', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CodeeditorService]
    });
  });

  it('should ...', inject([CodeeditorService], (service: CodeeditorService) => {
    expect(service).toBeTruthy();
  }));
});
