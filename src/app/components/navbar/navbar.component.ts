import { Component, OnInit, ElementRef } from '@angular/core';
import { ROUTES } from '../sidebar/sidebar.component';
import { Location } from '@angular/common';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { checkIsInPDFView } from '@app/_shares/common';

@Component({
    selector: 'app-navbar',
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
    private listTitles: any[];
    title = '';
    location: Location;
    mobile_menu_visible: any = 0;
    private toggleButton: any;
    private sidebarVisible: boolean;
    stringToSearch = '';

    constructor(
        location: Location,
        private element: ElementRef,
        private router: Router,
        private activatedRoute: ActivatedRoute) {
        this.location = location;
        this.sidebarVisible = false;
    }

    ngOnInit() {
        this.listTitles = ROUTES.reduce((pre, cur) => {
            const arr = [cur, ...(cur.children && cur.children.map(el => el) || [])];
            return [...pre, ...arr];
        }, []);
        const navbar: HTMLElement = this.element.nativeElement;
        this.toggleButton = navbar.getElementsByClassName('navbar-toggler')[0];
        this.router.events.subscribe((event) => {
            this.sidebarClose();
            /* tslint:disable-next-line */
            var $layer: any = document.getElementsByClassName('close-layer')[0];
            if ($layer) {
                $layer.remove();
                this.mobile_menu_visible = 0;
            }
        });
        this.router.events.subscribe((event: NavigationEnd) => {
            if (event instanceof NavigationEnd) {
              this._isInPDFView = checkIsInPDFView(event.url);
            }
        });
    }

    sidebarOpen() {
        const toggleButton = this.toggleButton;
        const body = document.getElementsByTagName('body')[0];
        setTimeout(function () {
            toggleButton.classList.add('toggled');
        }, 500);

        body.classList.add('nav-open');

        this.sidebarVisible = true;
    };
    sidebarClose() {
        const body = document.getElementsByTagName('body')[0];
        this.toggleButton.classList.remove('toggled');
        this.sidebarVisible = false;
        body.classList.remove('nav-open');
    };
    sidebarToggle() {
        /* tslint:disable-next-line */
        var $toggle = document.getElementsByClassName('navbar-toggler')[0];

        if (this.sidebarVisible === false) {
            this.sidebarOpen();
        } else {
            this.sidebarClose();
        }
        const body = document.getElementsByTagName('body')[0];

        if (this.mobile_menu_visible === 1) {
            body.classList.remove('nav-open');
            /* tslint:disable-next-line */
            if ($layer) {
                /* tslint:disable-next-line */
                $layer.remove();
            }
            setTimeout(function () {
                $toggle.classList.remove('toggled');
            }, 400);

            this.mobile_menu_visible = 0;
        } else {
            setTimeout(function () {
                $toggle.classList.add('toggled');
            }, 430);
            /* tslint:disable-next-line */
            var $layer = document.createElement('div');
            $layer.setAttribute('class', 'close-layer');


            if (body.querySelectorAll('.main-panel')) {
                document.getElementsByClassName('main-panel')[0].appendChild($layer);
            } else if (body.classList.contains('off-canvas-sidebar')) {
                document.getElementsByClassName('wrapper-full-page')[0].appendChild($layer);
            }

            setTimeout(function () {
                $layer.classList.add('visible');
            }, 100);

            $layer.onclick = function () { // asign a function
                body.classList.remove('nav-open');
                this.mobile_menu_visible = 0;
                $layer.classList.remove('visible');
                setTimeout(function () {
                    $layer.remove();
                    $toggle.classList.remove('toggled');
                }, 400);
            }.bind(this);

            body.classList.add('nav-open');
            this.mobile_menu_visible = 1;

        }
    };

    getTitle() {
        const titlee = this.location.prepareExternalUrl(this.location.path());
        const regexPath = /\/(admin|guest)\/.*/;
        const subpath = ((titlee.match(regexPath) || [])[0] || '')
            .replace(/\/(admin|guest)\//, '')
            .replace(/\?.*/, '');
        const found = (this.listTitles.filter(item => item.path === subpath) || [])[0] || {};
        const title = found.title || 'Dashboard';
        return title;
    }

    search() {
        if (this._isInPDFView) {
            // call search in pdf
            // just update the ?searchInPDF=...
            this.router.navigate(
                [],
                {
                    relativeTo: this.activatedRoute,
                    queryParams: { searchInPDF: this.stringToSearch || null, time: (new Date()).getTime() },
                    queryParamsHandling: 'merge'
                });
        } else {
            // call search normal in all page
        }
    }

    _isInPDFView;
}
