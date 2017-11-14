/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { MenueComponent } from './menue.component';

describe('MenueComponent', () => {
  let component: MenueComponent;
  let fixture: ComponentFixture<MenueComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MenueComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MenueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
