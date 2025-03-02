import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DownloadMyCvComponent } from './download-my-cv.component';

describe('DownloadMyCvComponent', () => {
  let component: DownloadMyCvComponent;
  let fixture: ComponentFixture<DownloadMyCvComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DownloadMyCvComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DownloadMyCvComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
