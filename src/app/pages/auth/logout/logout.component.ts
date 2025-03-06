import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { AuthService } from '@services/_index';
import { showNoti } from '@shared/common';
import { Router } from '@angular/router';
@Component({
  selector: 'app-logout',
  templateUrl: './logout.component.html'
})
export class LogoutComponent implements OnInit {
  @Output() isLoggedIn: EventEmitter<any> = new EventEmitter();
  @Output() isAdminE: EventEmitter<any> = new EventEmitter();

  isRunning = false;
  constructor(private authService: AuthService, private router: Router) { }

  async ngOnInit() {
    this.isRunning = true;
    await this.logout();
  }

  async logout() {
    this.authService.logout().subscribe(res => {
      this.isLoggedIn.emit(false);
      this.isAdminE.emit(false);
      this.router.navigate(['/login']);
      showNoti('Logout success!', 'success');
    }, (err) => {
      showNoti('Logout failed!', 'error');
    });
  }
}
