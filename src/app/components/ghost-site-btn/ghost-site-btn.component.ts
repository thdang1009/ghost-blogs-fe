import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-ghost-site-btn',
  templateUrl: './ghost-site-btn.component.html',
  styleUrls: ['./ghost-site-btn.component.css']
})
export class GhostSiteBtnComponent implements OnInit {
  @Input() link = '';
  @Input() type: typeBtn = 'btn';
  @Input() width = '';
  @Input() height = '';
  @Input() paddingLeft = '';
  @Input() boldText = true;
  @Input() active = false;
  @Output() callback = new EventEmitter<boolean>();

  commonClass = `
  hover:no-underline
  focus:no-underline
  flex
  items-center
  justify-center
  btn-css
  transition
  whitespace-nowrap
  `

  linkClass = `
  hover:text-blue
  rounded-none`;

  btnClass = `
  bg-blue
  text-white
  lift
  `;

  outlineClass = `
  bg-white
  !text-blue
  hover:text-blue
  lift
  rounded-[8px]
  border
  border-blue
  `;

  constructor() { }

  ngOnInit(): void {

  }
}

type typeBtn = 'btn' | 'link' | 'outline';

