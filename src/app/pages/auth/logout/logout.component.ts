import { Component, OnInit } from '@angular/core';
import { AuthService, AlertService } from '@services/_index';
import { Router } from '@angular/router';
@Component({
  selector: 'app-logout',
  templateUrl: './logout.component.html',
})
export class LogoutComponent implements OnInit {
  isRunning = false;
  constructor(
    private authService: AuthService,
    private router: Router,
    private alertService: AlertService
  ) {}

  async ngOnInit() {
    this.isRunning = true;
    await this.logout();
  }

  async logout() {
    this.authService.logout().subscribe(
      res => {
        if (res && res.success) {
          this.alertService.showNoti('Logout successful!', 'success');
          // State is updated via signals in AuthService; navigation handled there
        } else {
          this.alertService.showNoti(
            'Logout failed: Invalid response',
            'error'
          );
          this.router.navigate(['/login']);
        }
        this.isRunning = false;
      },
      err => {
        console.error('Logout error:', err);
        this.alertService.showNoti(
          'Logout failed: ' +
            (err.error?.msg || err.message || 'Unknown error'),
          'error'
        );
        this.router.navigate(['/login']);
        this.isRunning = false;
      }
    );
  }
}
