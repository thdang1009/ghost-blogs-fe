import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-progress-with-label',
  templateUrl: './progress-with-label.component.html',
  styleUrls: ['./progress-with-label.component.css']
})
export class ProgressWithLabelComponent implements OnInit {

  @Input() percent: number;
  @Input() label: string;
  constructor() { }

  ngOnInit(): void {
  }

}
