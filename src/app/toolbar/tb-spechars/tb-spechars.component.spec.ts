/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { TbSpecharsComponent } from './tb-spechars.component';

describe('TbSettingsComponent', () => {
  let component: TbSpecharsComponent;
  let fixture: ComponentFixture<TbSpecharsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TbSpecharsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TbSpecharsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
