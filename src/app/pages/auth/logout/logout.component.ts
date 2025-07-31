import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { AuthService, AlertService } from '@services/_index';
import { Router } from '@angular/router';
@Component({
  selector: 'app-logout',
  templateUrl: './logout.component.html',
})
export class LogoutComponent implements OnInit {
  @Output() isLoggedIn: EventEmitter<any> = new EventEmitter();
  @Output() isAdminE: EventEmitter<any> = new EventEmitter();

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
          this.isLoggedIn.emit(false);
          this.isAdminE.emit(false);
          this.alertService.showNoti('Logout successful!', 'success');
          // Navigation is handled in the auth service
        } else {
          this.alertService.showNoti(
            'Logout failed: Invalid response',
            'error'
          );
          // Still clear local state even if backend fails
          this.isLoggedIn.emit(false);
          this.isAdminE.emit(false);
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
        // Clear local state even if backend call fails
        this.isLoggedIn.emit(false);
        this.isAdminE.emit(false);
        this.router.navigate(['/login']);
        this.isRunning = false;
      }
    );
  }
}
