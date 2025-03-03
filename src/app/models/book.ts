import { BookPermission } from '@shared/enum';
import { MyFile } from './my-file';
import { User } from './user';
export class Book {
  id?: string;
  title?: string;
  user?: User;
  content?: string; // content
  score?: number;
  isDone?: boolean;
  slot?: number; // 1, 2, 3
  url?: String;
  permission?: BookPermission;
  createdAt?: Date;
  updatedAt?: Date;
  files?: MyFile[];
  urlGet?: string;
}
