import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { NoveltyTabComponent } from './novelty-tab/novelty-tab.component';
import { PeopleTabComponent } from './people-tab/people-tab.component';

export type LifeTab = 'novelty' | 'people';

/**
 * Trang Life (ADR 0003): hai thói quen sống, hai tab.
 *
 * Trang quản lý đầy đủ ở đây; trên bảng Todo Today chỉ có hai widget một
 * dòng. Tab đang mở nằm trên query param (`?tab=people`) để widget trên bảng
 * link thẳng tới đúng tab.
 */
@Component({
  selector: 'app-life',
  standalone: true,
  imports: [CommonModule, NoveltyTabComponent, PeopleTabComponent],
  templateUrl: './life.component.html',
  styleUrls: ['./life.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LifeComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

  tab: LifeTab = 'novelty';

  readonly tabs: { value: LifeTab; label: string }[] = [
    { value: 'novelty', label: '✨ Trải nghiệm mới' },
    { value: 'people', label: '👥 Người quan trọng' },
  ];

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      this.tab = params.get('tab') === 'people' ? 'people' : 'novelty';
      this.cdr.markForCheck();
    });
  }

  select(tab: LifeTab): void {
    if (tab === this.tab) return;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab: tab === 'novelty' ? null : tab },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }
}
