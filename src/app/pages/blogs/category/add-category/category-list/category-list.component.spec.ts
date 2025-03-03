import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AbstractMockObservableService } from '@helpers/mock.service';
import { CategoryService } from '@services/_index';

import { CategoryListComponent } from './category-list.component';
class MockCategoryService extends AbstractMockObservableService {
  getCategorys() {
    return this;
  }
}
describe('CategoryListComponent', () => {
  let component: CategoryListComponent;
  let fixture: ComponentFixture<CategoryListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CategoryListComponent ],
      providers: [
        { provide: CategoryService, useValue: new MockCategoryService()}
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CategoryListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
