import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SkeletonLoaderComponent } from './skeleton-loader.component';

describe('SkeletonLoaderComponent', () => {
  let component: SkeletonLoaderComponent;
  let fixture: ComponentFixture<SkeletonLoaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SkeletonLoaderComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SkeletonLoaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ── Defaults ──────────────────────────────────────────────────────────────────

  describe('Input defaults', () => {
    it('type defaults to "post-card"', () => {
      expect(component.type).toBe('post-card');
    });

    it('count defaults to 1', () => {
      expect(component.count).toBe(1);
    });
  });

  // ── items getter ──────────────────────────────────────────────────────────────

  describe('items getter', () => {
    it('returns an array with length equal to count', () => {
      component.count = 3;
      expect(component.items.length).toBe(3);
    });

    it('returns [0] when count is 1', () => {
      component.count = 1;
      expect(component.items).toEqual([0]);
    });

    it('returns [0,1,2,3,4] when count is 5', () => {
      component.count = 5;
      expect(component.items).toEqual([0, 1, 2, 3, 4]);
    });

    it('returns an empty array when count is 0', () => {
      component.count = 0;
      expect(component.items).toEqual([]);
    });
  });

  // ── Type variants ─────────────────────────────────────────────────────────────

  describe('type input', () => {
    const validTypes: Array<SkeletonLoaderComponent['type']> = [
      'post-card',
      'compact-card',
      'tag-chip',
      'series-card',
    ];

    validTypes.forEach(type => {
      it(`accepts type "${type}"`, () => {
        component.type = type;
        fixture.detectChanges();
        expect(component.type).toBe(type);
      });
    });
  });
});
