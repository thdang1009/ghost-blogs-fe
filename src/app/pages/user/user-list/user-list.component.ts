import { Component, OnInit } from '@angular/core';
import { User } from '@models/_index';
import { UserService, AlertService } from '@services/_index';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html'
})
export class UserListComponent implements OnInit {

  users: User[] = [];
  constructor(private userService: UserService, private alertService: AlertService) { }

  ngOnInit(): void {
    this.userService.getUsers().subscribe(users => {
      // showNoti('Get users success!', 'success');
      this.users = users;
    }, (err) => {
      console.log(err);
      this.alertService.showNoti(`Create user fail!`, 'danger');
    });
  }
}
