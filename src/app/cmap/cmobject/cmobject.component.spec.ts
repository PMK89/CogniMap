/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { CmobjectComponent } from './cmobject.component';

describe('CmobjectComponent', () => {
  let component: CmobjectComponent;
  let fixture: ComponentFixture<CmobjectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CmobjectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CmobjectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
