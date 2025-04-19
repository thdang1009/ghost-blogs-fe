import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { AuthService, AlertService } from '@services/_index';
import { Router } from '@angular/router';
@Component({
  selector: 'app-logout',
  templateUrl: './logout.component.html'
})
export class LogoutComponent implements OnInit {
  @Output() isLoggedIn: EventEmitter<any> = new EventEmitter();
  @Output() isAdminE: EventEmitter<any> = new EventEmitter();

  isRunning = false;
  constructor(
    private authService: AuthService,
    private router: Router,
    private alertService: AlertService
  ) { }

  async ngOnInit() {
    this.isRunning = true;
    await this.logout();
  }

  async logout() {
    this.authService.logout().subscribe(res => {
      this.isLoggedIn.emit(false);
      this.isAdminE.emit(false);
      this.router.navigate(['/login']);
      this.alertService.showNoti('Logout success!', 'success');
    }, (err) => {
      this.alertService.showNoti('Logout failed!', 'error');
    });
  }
}
