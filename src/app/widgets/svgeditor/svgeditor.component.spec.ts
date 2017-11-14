/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { SvgeditorComponent } from './svgeditor.component';

describe('SvgeditorComponent', () => {
  let component: SvgeditorComponent;
  let fixture: ComponentFixture<SvgeditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SvgeditorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SvgeditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
