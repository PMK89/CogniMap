/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { TbContentComponent } from './tb-content.component';

describe('TbContentComponent', () => {
  let component: TbContentComponent;
  let fixture: ComponentFixture<TbContentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TbContentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TbContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
