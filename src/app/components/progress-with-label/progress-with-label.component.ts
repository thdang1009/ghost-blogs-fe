import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
} from '@angular/core';

@Component({
  selector: 'app-progress-with-label',
  templateUrl: './progress-with-label.component.html',
  styleUrls: ['./progress-with-label.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgressWithLabelComponent implements OnInit {
  @Input() percent: number = 0;
  @Input() label: string = '';
  constructor() {}

  ngOnInit(): void {}
}
