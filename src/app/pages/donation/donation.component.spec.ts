import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DonationComponent } from './donation.component';
import { Renderer2 } from '@angular/core';
import { openNewTab } from '@shared/common';

describe('DonationComponent', () => {
  let component: DonationComponent;
  let fixture: ComponentFixture<DonationComponent>;
  const rendererSpy = jasmine.createSpyObj('Renderer2', [
    'createElement',
    'setAttribute',
    'appendChild',
    'removeChild'
  ]);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DonationComponent],
      providers: [
        { provide: Renderer2, useValue: rendererSpy }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DonationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });
});
