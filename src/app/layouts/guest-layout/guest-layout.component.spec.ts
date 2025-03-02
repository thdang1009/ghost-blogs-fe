import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, RouterEvent } from '@angular/router';
import { ReplaySubject } from 'rxjs';

import { GuestLayoutComponent } from './guest-layout.component';

describe('GuestLayoutComponent', () => {
  let component: GuestLayoutComponent;
  let fixture: ComponentFixture<GuestLayoutComponent>;

  let routerEventReplaySubject: ReplaySubject<RouterEvent>;
  let routerMock;

  beforeEach(waitForAsync(() => {
    const locationSpy = jasmine.createSpyObj('Location', ['prepareExternalUrl', 'back', 'path', 'subscribe']);
    routerEventReplaySubject = new ReplaySubject<RouterEvent>(1);
    routerMock = {
      events: routerEventReplaySubject.asObservable()
    };
    TestBed.configureTestingModule({
      declarations: [GuestLayoutComponent],
      providers: [
        { provide: Router, useValue: routerMock },
        { provide: Location, useValue: locationSpy }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GuestLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
