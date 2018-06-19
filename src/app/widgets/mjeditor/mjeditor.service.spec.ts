/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { MjEditorService } from './mjeditor.service';

describe('Service: MjEditor', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MjEditorService]
    });
  });

  it('should ...', inject([MjEditorService], (service: MjEditorService) => {
    expect(service).toBeTruthy();
  }));
});
