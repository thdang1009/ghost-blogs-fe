import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TagListComponent } from './tag-list.component';
import { TagService } from '@services/_index';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Tag } from '@models/_index';

describe('TagListComponent', () => {
  let component: TagListComponent;
  let fixture: ComponentFixture<TagListComponent>;
  let tagService: jasmine.SpyObj<TagService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const tagServiceSpy = jasmine.createSpyObj('TagService', ['getTags', 'deleteTag']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      declarations: [TagListComponent],
      providers: [
        { provide: TagService, useValue: tagServiceSpy },
        { provide: Router, useValue: routerSpy }
      ],
      schemas: [NO_ERRORS_SCHEMA] // Ignore unknown elements
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TagListComponent);
    component = fixture.componentInstance;
    tagService = TestBed.inject(TagService) as jasmine.SpyObj<TagService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should retrieve tags on initialization', () => {
    const mockTags: Tag[] = [{ _id: '1', name: 'Tag 1' }, { _id: '2', name: 'Tag 2' }];
    tagService.getTags.and.returnValue(of(mockTags));

    component.ngOnInit();

    expect(tagService.getTags).toHaveBeenCalled();
    expect(component.tags).toEqual(mockTags);
  });

  it('should handle error when retrieving tags', () => {
    const consoleSpy = spyOn(console, 'log');
    tagService.getTags.and.returnValue(throwError('Error fetching tags'));

    component.getTags();

    expect(consoleSpy).toHaveBeenCalledWith('Error fetching tags');
  });

  it('should delete a tag and refresh the list', () => {
    const mockTag: Tag = { _id: '1', name: 'Tag 1' };
    tagService.deleteTag.and.returnValue(of({ success: true } as Tag));
    spyOn(component, 'getTags').and.callThrough(); // Spy on getTags to check if it's called

    component.delete(mockTag);

    expect(tagService.deleteTag).toHaveBeenCalledWith(mockTag._id);
    expect(component.getTags).toHaveBeenCalled(); // Check if getTags is called after deletion
  });

  it('should not delete a tag if tag is null', () => {
    component.delete(null as any);
    expect(tagService.deleteTag).not.toHaveBeenCalled();
  });

  it('should navigate to edit tag', () => {
    const mockTag: Tag = { _id: '1', name: 'Tag 1' };
    component.edit(mockTag);

    expect(router.navigate).toHaveBeenCalledWith(['admin/blog/tag'], {
      queryParams: { id: mockTag._id }
    });
  });

  it('should not navigate if tag is null', () => {
    component.edit(null as any);
    expect(router.navigate).not.toHaveBeenCalled();
  });
});
