/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { CmcontentComponent } from './cmcontent.component';

describe('CmcontentComponent', () => {
  let component: CmcontentComponent;
  let fixture: ComponentFixture<CmcontentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CmcontentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CmcontentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
