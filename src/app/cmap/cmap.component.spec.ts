/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { CmapComponent } from './cmap.component';

describe('CmapComponent', () => {
  let component: CmapComponent;
  let fixture: ComponentFixture<CmapComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CmapComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CmapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
