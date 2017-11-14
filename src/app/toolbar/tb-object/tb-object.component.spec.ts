/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { TbObjectComponent } from './tb-object.component';

describe('TbObjectComponent', () => {
  let component: TbObjectComponent;
  let fixture: ComponentFixture<TbObjectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TbObjectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TbObjectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
