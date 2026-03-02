import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'view-book',
  templateUrl: './view-book.component.html',
  styleUrls: ['./view-book.component.scss'],
})
export class ViewBookComponent implements OnInit {
  pdfSrc!: string;
  pdfFileName!: string;
  newLink = '';
  isReady = false;
  isLoadingResults = false;

  constructor(private activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe(params => {
      const link = params['link'];
      const title = params['title'];
      if (link) {
        this.pdfSrc = link;
        this.pdfFileName = title;
        this.isReady = true;
      }
    });
  }
  tryToGetBook() {
    this.pdfSrc = this.newLink;
    this.pdfFileName = new Date().getTime().toString();
    this.isReady = true;
  }
}
