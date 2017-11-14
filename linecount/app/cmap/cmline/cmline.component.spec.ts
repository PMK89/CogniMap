/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { CmlineComponent } from './cmline.component';

describe('CmlineComponent', () => {
  let component: CmlineComponent;
  let fixture: ComponentFixture<CmlineComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CmlineComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CmlineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
