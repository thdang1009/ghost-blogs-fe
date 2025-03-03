export class User {
  id?: number;
  fullName!: string;
  username!: string;
  permission!: string;
  password?: string;
  createBy?: string;
  status?: string;
  updateBy?: string;
}

export class UserReadingInfo {
  jsonString: any;
}
