import { Component, OnInit } from '@angular/core';
import { User } from '@models/_index';
import { UserService, AlertService } from '@services/_index';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit {
  users: User[] = [];
  loading = false;

  constructor(
    private userService: UserService,
    private alertService: AlertService
  ) { }

  ngOnInit(): void {
    this.getUsers();
  }

  getUsers() {
    this.loading = true;
    this.userService.getUsers().subscribe(
      users => {
        this.users = users;
        this.loading = false;
      },
      err => {
        console.log(err);
        this.alertService.showNoti(`Failed to load users!`, 'danger');
        this.loading = false;
      }
    );
  }
}
