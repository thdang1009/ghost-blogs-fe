import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AbstractMockObservableService } from '@helpers/mock.service';
import { TagService } from '@services/_index';

import { TagListComponent } from './tag-list.component';
class MockTagService extends AbstractMockObservableService {
  getTags() {
    return this;
  }
}
describe('TagListComponent', () => {
  let component: TagListComponent;
  let fixture: ComponentFixture<TagListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TagListComponent ],
      providers: [
        { provide: TagService, useValue: new MockTagService()}
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TagListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
