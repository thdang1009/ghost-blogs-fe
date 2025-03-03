import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UntypedFormBuilder } from '@angular/forms';
import { RouterEvent, Router, ActivatedRoute } from '@angular/router';
import { TagService, AlertService } from '@services/_index';
import { of, ReplaySubject } from 'rxjs';

import { AddTagComponent } from './add-tag.component';

describe('AddTagComponent', () => {
  let component: AddTagComponent;
  let fixture: ComponentFixture<AddTagComponent>;

  let routerEventReplaySubject: ReplaySubject<RouterEvent>;
  let routerMock;

  beforeEach(async () => {
    const alertServiceSpy = jasmine.createSpyObj('AlertService', ['error']);
    const tagServiceSpy = jasmine.createSpyObj('TagService', ['getTags']);
    routerEventReplaySubject = new ReplaySubject<RouterEvent>(1);
    routerMock = {
      events: routerEventReplaySubject.asObservable()
    };
    TestBed.configureTestingModule({
      declarations: [AddTagComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({ id: 123 }),
            queryParams: of({ id: 123 })
          },
        },
        UntypedFormBuilder,
        { provide: AlertService, useValue: alertServiceSpy },
        { provide: Router, useValue: routerMock },
        { provide: TagService, useValue: tagServiceSpy}

      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddTagComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
