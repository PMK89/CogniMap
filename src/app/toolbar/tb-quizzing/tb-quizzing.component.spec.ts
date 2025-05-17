/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { TbquizzingComponent } from './tb-quizzing.component';

describe('TbquizzingComponent', () => {
  let component: TbquizzingComponent;
  let fixture: ComponentFixture<TbquizzingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TbquizzingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TbquizzingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
