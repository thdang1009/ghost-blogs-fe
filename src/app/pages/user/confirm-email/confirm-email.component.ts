import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService, NavigationService } from '@services/_index';
import { showNoti } from '@shared/common';

@Component({
  selector: 'app-confirm-email',
  templateUrl: './confirm-email.component.html',
  styleUrls: ['./confirm-email.component.scss']
})
export class ConfirmEmailComponent implements OnInit {

  constructor(
    private authenService: AuthService,
    private route: ActivatedRoute,
    private navigationService: NavigationService
  ) { }

  ngOnInit(): void {
    const code = this.route.snapshot.params['confirmationCode'];
    this.authenService.confirmEmail(code)
      .subscribe(_ => {
        showNoti(`Successfully confirm email!`, 'success');
        this.navigationService.gotoHome();
      }, err => {

        console.log(err);
        showNoti(`Confirm fail ${err}`, 'danger');
      });
  }

}
