/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { NumberchangeComponent } from './numberchange.component';

describe('NumberchangeComponent', () => {
  let component: NumberchangeComponent;
  let fixture: ComponentFixture<NumberchangeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NumberchangeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NumberchangeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
