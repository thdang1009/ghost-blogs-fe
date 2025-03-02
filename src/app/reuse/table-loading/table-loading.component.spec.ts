import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TableLoadingComponent } from './table-loading.component';

describe('TableLoadingComponent', () => {
  let component: TableLoadingComponent;
  let fixture: ComponentFixture<TableLoadingComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [TableLoadingComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TableLoadingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
