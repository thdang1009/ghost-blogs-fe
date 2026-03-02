import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { HireMeComponent } from './hire-me.component';

describe('HireMeComponent', () => {
  let component: HireMeComponent;
  let fixture: ComponentFixture<HireMeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HireMeComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HireMeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
