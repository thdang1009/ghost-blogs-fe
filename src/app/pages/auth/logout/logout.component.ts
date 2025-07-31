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
        // AuthService already handles cleanup, just emit events and navigate
        this.isLoggedIn.emit(false);
        this.isAdminE.emit(false);
        this.isRunning = false;

        // Navigate to login after a short delay
        setTimeout(() => {
          this.router.navigate(['/login']);
          this.alertService.showNoti('Logout success!', 'success');
        }, 500);
      },
      err => {
        // This should rarely happen now since we handle errors in AuthService
        console.error('Logout error:', err);
        this.isLoggedIn.emit(false);
        this.isAdminE.emit(false);
        this.isRunning = false;
        this.router.navigate(['/login']);
        this.alertService.showNoti('Logged out (with warnings)', 'warning');
      }
    );
  }
}
