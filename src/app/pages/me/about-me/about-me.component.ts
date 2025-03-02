import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, NgForm, Validators } from '@angular/forms';
import { GuestMessageService } from '@services/_index';
import { showNoti } from '@shared/common';

export interface PortfolioData {
  src: string,
  title: string,
  allowFullscreen: boolean
}
@Component({
  selector: 'app-about-me',
  templateUrl: './about-me.component.html',
  styleUrls: ['./about-me.component.scss']
})
export class AboutMeComponent implements OnInit, AfterViewInit {
  @ViewChild('aboutMe') aboutMeElement: ElementRef | undefined;
  @ViewChild('portfolio') portfolioElement: ElementRef | undefined;
  @ViewChild('contact') contactElement: ElementRef | undefined;
  @ViewChild('aboutMeContent') aboutMeContent: ElementRef | undefined;


  isRunning = false;
  contactForm!: UntypedFormGroup;
  heights: number[] = [];
  yearOlds: number | undefined;
  currentActive = 0;
  debounceID = undefined;
  listPortfolio: Array<PortfolioData> = [{
    src: 'https://dangtrinh.site/home',
    title: 'Personal\'s blogs',
    allowFullscreen: true
  }, {
    src: 'https://mc.zalopay.vn/homepage/index.html',
    title: 'Merchant tool',
    allowFullscreen: true
  }];
  arrString = ['A Fullstack Web Engineer', 'A Javascript Lover', 'A Minimalist', 'A Book Reviewer', 'A Blogger'];

  indexInterval = 0;
  constructor(
    private formBuilder: UntypedFormBuilder,
    private guestMessage: GuestMessageService) { }

  ngOnInit(): void {
    this.yearOlds = new Date().getFullYear() - 1996;
    this.contactForm = this.formBuilder.group({
      name: [null, Validators.required],
      email: [null, Validators.required],
      subject: [null, Validators.required],
      message: [null, Validators.required],

    });
  }
  ngAfterViewInit(): void {
    this.heights = [
      0,
      this.aboutMeElement?.nativeElement.offsetTop,
      this.portfolioElement?.nativeElement.offsetTop,
      this.contactElement?.nativeElement.offsetTop
    ];
  }
  sendMessageToMe(form: NgForm) {
    this.isRunning = true;
    this.guestMessage.sendGuestMessage(form)
      .subscribe(res => {
        this.isRunning = false;
        if (res && res.id) {
          showNoti('Send success!', 'success');
        }
      }, (err) => {
        this.isRunning = false;
        showNoti('Send Fail! ' + err.error, 'danger');
      });
    // call api save guest message
  }
  scrollTo(s: string) {
    const element = document.getElementById(s);
    element?.scrollIntoView({ block: 'start', behavior: 'smooth' });
  }
  downloadCV() {
    // TODO not implemented yet
  }
  hireMe() {
    // TODO not implemented yet
  }
  onMessageChange() {

  }

  checkOffsetTop(event: any) {
    const val = this.aboutMeContent?.nativeElement.scrollTop;
    if (val >= this.heights[0] && val < this.heights[1]) {
      this.currentActive = 0;
    } else if (val >= this.heights[1] && val < this.heights[2]) {
      this.currentActive = 1;
    } else if (val >= this.heights[2]) {
      this.currentActive = 2;
    } else {
      this.currentActive = 0;
    }
  }

  openAD() {
    window.open('https://ad.zalopay.vn', '_blank');
  }
  openMC() {
    window.open('https://mc.zalopay.vn', '_blank');
  }
}
