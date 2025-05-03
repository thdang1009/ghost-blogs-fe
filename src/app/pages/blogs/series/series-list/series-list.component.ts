import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Series } from '@models/_index';
import { AlertService, SeriesService } from '@services/_index';

@Component({
  selector: 'app-series-list',
  templateUrl: './series-list.component.html',
  styleUrls: ['./series-list.component.scss']
})
export class SeriesListComponent implements OnInit {
  series: Series[] = [];
  loading = false;

  constructor(
    private seriesService: SeriesService,
    private router: Router,
    private alertService: AlertService
  ) { }

  ngOnInit(): void {
    this.loadSeries();
  }

  loadSeries(): void {
    this.loading = true;
    this.seriesService.getAllSeries().subscribe(
      (data: Series[]) => {
        this.series = data;
        this.loading = false;
      },
      error => {
        this.alertService.showNoti('Failed to load series: ' + error, 'danger');
        this.loading = false;
      }
    );
  }

  delete(series: Series): void {
    if (!series || !series.id) {
      return;
    }

    if (confirm(`Are you sure you want to delete the series "${series.name}"?`)) {
      this.loading = true;
      this.seriesService.deleteSeries(series.id).subscribe(
        () => {
          this.alertService.showNoti(`Series "${series.name}" deleted successfully`, 'success');
          this.loadSeries();
        },
        error => {
          this.alertService.showNoti('Failed to delete series: ' + error, 'danger');
          this.loading = false;
        }
      );
    }
  }

  edit(series: Series): void {
    if (!series || !series.id) {
      return;
    }
    this.router.navigate(
      ['admin/blog/series'],
      {
        queryParams: { id: series.id }
      });
  }
}
