/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { TbLineComponent } from './tb-line.component';

describe('TbLineComponent', () => {
  let component: TbLineComponent;
  let fixture: ComponentFixture<TbLineComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TbLineComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TbLineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
