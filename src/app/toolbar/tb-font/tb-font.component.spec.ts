/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { TbFontComponent } from './tb-font.component';

describe('TbFontComponent', () => {
  let component: TbFontComponent;
  let fixture: ComponentFixture<TbFontComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TbFontComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TbFontComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
