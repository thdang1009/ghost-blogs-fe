import { DOCUMENT } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  Inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  NgForm,
  Validators,
} from '@angular/forms';
import { Meta } from '@angular/platform-browser';
import { GuestMessageService, AlertService } from '@services/_index';
import { addStructuredData } from '@shared/common';

export interface PortfolioData {
  src: string;
  title: string;
  allowFullscreen: boolean;
}

export interface ExperienceItem {
  period: string;
  company: string;
  companyUrl?: string;
  role: string;
  impact: string;
  tech: string[];
}

export interface EducationItem {
  period: string;
  school: string;
  degree: string;
  url?: string;
}

export interface TechGroup {
  label: string;
  items: string[];
}

export interface Stat {
  label: string;
  value: string;
  url?: string;
}
@Component({
  selector: 'app-about-me',
  templateUrl: './about-me.component.html',
  styleUrls: ['./about-me.component.scss'],
})
export class AboutMeComponent implements OnInit, AfterViewInit {
  @ViewChild('aboutMe') aboutMeElement: ElementRef | undefined;
  @ViewChild('portfolio') portfolioElement: ElementRef | undefined;
  @ViewChild('contact') contactElement: ElementRef | undefined;
  @ViewChild('aboutMeContent') aboutMeContent: ElementRef | undefined;

  isRunning = false;
  contactForm!: UntypedFormGroup;
  heights: number[] = [];
  currentActive = 0;
  debounceID = undefined;
  listPortfolio: Array<PortfolioData> = [
    {
      src: 'https://mc.zalopay.vn/homepage/index.html',
      title: 'Merchant tool',
      allowFullscreen: true,
    },
    {
      src: 'https://tarotfree.netlify.app/',
      title: 'Tarot free',
      allowFullscreen: true,
    },
    {
      src: 'https://diff-tool.netlify.app/',
      title: 'Diff tool',
      allowFullscreen: true,
    },
    {
      src: 'https://thdang1009.github.io/bio-hazard/',
      title: 'Bio Hazard',
      allowFullscreen: true,
    },
  ];
  arrString = [
    'Senior Full Stack Engineer',
    '8+ years of JavaScript',
    'Angular · Vue · Node · NestJS',
    'Top 1% on CodeWars',
    'Minimalist · Open to freelance',
  ];

  experiences: ExperienceItem[] = [
    {
      period: 'Apr 2025 — Present',
      company: 'CoverGo',
      companyUrl: 'https://covergo.com/',
      role: 'Senior Full Stack Engineer',
      impact:
        'Multi-tenant insurance platform — drove a war-room project to production in 6 months, integrated AI agents into the SDLC, owned claims & pre-auth workflows.',
      tech: ['Vue', 'NestJS', 'PostgreSQL', 'GraphQL', 'AWS'],
    },
    {
      period: 'Sep 2023 — Apr 2025',
      company: 'BlueSG',
      companyUrl: 'https://www.linkedin.com/company/bluesg',
      role: 'Senior Full Stack Engineer',
      impact:
        'Owned the microservice backbone for an EV car-sharing platform — User, Billing, Station, Notification & Promotion services. Mentored team, drove architectural decisions across Vietnam & Singapore.',
      tech: [
        'Angular',
        'NestJS',
        'PostgreSQL',
        'MongoDB',
        'AWS SQS/SNS/EventBridge',
      ],
    },
    {
      period: 'Nov 2017 — Sep 2023',
      company: 'ZaloPay',
      companyUrl: 'https://zalopay.vn/',
      role: 'Junior → Mid → Senior Software Engineer',
      impact:
        'Merchant self-onboarding, dashboard, QR & reconciliation tooling on a high-traffic fintech platform. Designed high-performance schemas and gRPC services.',
      tech: ['Angular', 'NodeJS', 'MySQL', 'Kafka', 'gRPC'],
    },
  ];

  educations: EducationItem[] = [
    {
      period: '2014 — 2018',
      school: 'HCMUS — VNU-HCM',
      degree: 'B.Sc. Software Engineering',
      url: 'https://www.hcmus.edu.vn/',
    },
  ];

  techGroups: TechGroup[] = [
    {
      label: 'Frontend',
      items: ['Angular', 'Vue', 'TypeScript', 'HTML', 'CSS/SCSS'],
    },
    {
      label: 'Backend',
      items: ['NodeJS', 'NestJS', 'REST', 'GraphQL', 'gRPC'],
    },
    { label: 'Data', items: ['PostgreSQL', 'MongoDB', 'MySQL', 'Redis'] },
    { label: 'Cloud', items: ['AWS', 'SQS', 'SNS', 'EventBridge', 'Kafka'] },
  ];

  stats: Stat[] = [
    { value: `${new Date().getFullYear() - 2018}+`, label: 'Years experience' },
    {
      value: 'Top 1%',
      label: 'CodeWars',
      url: 'https://www.codewars.com/users/Ghost96',
    },
    {
      value: 'Gold',
      label: 'HackerRank',
      url: 'https://www.hackerrank.com/profile/trinh_hai_dang',
    },
  ];

  indexInterval = 0;
  constructor(
    private formBuilder: UntypedFormBuilder,
    private guestMessage: GuestMessageService,
    private meta: Meta,
    private alertService: AlertService,
    @Inject(DOCUMENT) private document: Document
  ) {
    addStructuredData(this.document);

    this.meta.updateTag({ itemprop: 'name', content: 'About Dang Trinh' });
    this.meta.updateTag({
      itemprop: 'description',
      content: 'Detail about Dang Trinh',
    });
    this.meta.updateTag({ name: 'twitter:card', content: 'summary' });
    this.meta.updateTag({ name: 'twitter:title', content: 'About Dang Trinh' });
    this.meta.updateTag({
      name: 'twitter:description',
      content: 'Detail about Dang Trinh',
    });
    this.meta.updateTag({ name: 'twitter:creator', content: 'Dang Trinh' });
    this.meta.updateTag({
      name: 'twitter:image',
      content: 'https://dangtrinh.site/assets/img/ghost.png',
    });
    this.meta.updateTag({ property: 'og:title', content: 'About Dang Trinh' });
    this.meta.updateTag({
      property: 'og:description',
      content: 'Detail about Dang Trinh',
    });
    this.meta.updateTag({ property: 'og:creator', content: 'Dang Trinh' });
    this.meta.updateTag({
      property: 'og:image',
      content: 'https://dangtrinh.site/assets/img/ghost.png',
    });
  }

  ngOnInit(): void {
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
      this.contactElement?.nativeElement.offsetTop,
    ];
  }
  sendMessageToMe(form: NgForm) {
    this.isRunning = true;
    this.guestMessage.sendGuestMessage(form).subscribe(
      res => {
        this.isRunning = false;
        if (res && res.id) {
          this.alertService.showNoti('Send success!', 'success');
        }
      },
      err => {
        this.isRunning = false;
        this.alertService.showNoti('Send Fail! ' + err.error, 'danger');
      }
    );
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
  onMessageChange() {}

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
