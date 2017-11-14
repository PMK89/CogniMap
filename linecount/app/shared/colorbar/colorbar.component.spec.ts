/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { ColorbarComponent } from './colorbar.component';

describe('ColorbarComponent', () => {
  let component: ColorbarComponent;
  let fixture: ComponentFixture<ColorbarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ColorbarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ColorbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
