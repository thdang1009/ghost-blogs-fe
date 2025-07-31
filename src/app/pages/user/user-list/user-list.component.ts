import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '@models/_index';
import { UserService, AlertService } from '@services/_index';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss'],
})
export class UserListComponent implements OnInit {
  users: User[] = [];
  loading = false;

  constructor(
    private userService: UserService,
    private alertService: AlertService,
    private router: Router
  ) {}

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

  editUser(user: User) {
    // For now, navigate to add-user with query params to indicate edit mode
    // A proper implementation would have a separate edit-user component
    this.router.navigate(['/admin/user/add-user'], {
      queryParams: {
        edit: true,
        userId: user.id,
      },
    });
  }
}
