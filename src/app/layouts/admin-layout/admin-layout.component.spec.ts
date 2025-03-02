import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminLayoutComponent } from './admin-layout.component';
import { Router, RouterEvent } from '@angular/router';
import { ReplaySubject } from 'rxjs';

describe('AdminLayoutComponent', () => {
  let component: AdminLayoutComponent;
  let fixture: ComponentFixture<AdminLayoutComponent>;

  let routerEventReplaySubject: ReplaySubject<RouterEvent>;
  let routerMock;

  beforeEach(waitForAsync(() => {
    const locationSpy = jasmine.createSpyObj('Location', ['prepareExternalUrl', 'back', 'path', 'subscribe']);
    routerEventReplaySubject = new ReplaySubject<RouterEvent>(1);
    routerMock = {
      events: routerEventReplaySubject.asObservable()
    };

    TestBed.configureTestingModule({
      declarations: [
        AdminLayoutComponent
      ],
      providers: [
        { provide: Router, useValue: routerMock },
        { provide: Location, useValue: locationSpy }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
