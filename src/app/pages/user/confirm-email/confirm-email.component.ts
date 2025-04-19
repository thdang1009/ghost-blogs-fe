import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AlertService, AuthService, NavigationService } from '@services/_index';

@Component({
  selector: 'app-confirm-email',
  templateUrl: './confirm-email.component.html',
  styleUrls: ['./confirm-email.component.scss']
})
export class ConfirmEmailComponent implements OnInit {

  constructor(
    private authenService: AuthService,
    private route: ActivatedRoute,
    private navigationService: NavigationService,
    private alertService: AlertService
  ) { }

  ngOnInit(): void {
    const code = this.route.snapshot.params['confirmationCode'];
    this.authenService.confirmEmail(code)
      .subscribe(_ => {
        this.alertService.showNoti(`Successfully confirm email!`, 'success');
        this.navigationService.gotoLogin();
      }, err => {

        console.log(err);
        this.alertService.showNoti(`Confirm fail ${err}`, 'danger');
      });
  }

}
