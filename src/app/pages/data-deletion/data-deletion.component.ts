import { Component, OnInit } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

@Component({
  selector: 'app-data-deletion',
  templateUrl: './data-deletion.component.html',
  styleUrls: ['./data-deletion.component.scss']
})
export class DataDeletionComponent implements OnInit {

  constructor(
    private titleService: Title,
    private metaService: Meta
  ) { }

  ngOnInit(): void {
    this.titleService.setTitle('Data Deletion Instructions - Ghost Site');
    this.metaService.updateTag({ name: 'description', content: 'Instructions for deleting your data from Ghost Site in compliance with Facebook requirements.' });
  }
}
