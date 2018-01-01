/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { TbquizeditComponent } from './tb-quizedit.component';

describe('TbquizeditComponent', () => {
  let component: TbquizeditComponent;
  let fixture: ComponentFixture<TbquizeditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TbquizeditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TbquizeditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
