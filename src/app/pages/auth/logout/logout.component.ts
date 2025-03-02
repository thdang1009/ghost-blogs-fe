import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { AuthService } from '@services/_index';
import { showNoti } from '@shared/common';

@Component({
  selector: 'app-logout',
  templateUrl: './logout.component.html'
})
export class LogoutComponent implements OnInit {
  @Output() isLoggedIn: EventEmitter<any> = new EventEmitter();
  @Output() isAdminE: EventEmitter<any> = new EventEmitter();

  isRunning = false;
  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    this.isRunning = true;
    this.authService.logout()
      .subscribe(_ => {
        this.isRunning = false;
        this.isLoggedIn.emit(false);
        this.isAdminE.emit(false);
        showNoti('Logout success!', 'success');
      }, (err) => {
        this.isRunning = false;
      });
  }
}
