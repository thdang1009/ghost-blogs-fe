import { Tag } from './_index';

export class Subscription {
  _id?: string;
  userId?: string;
  email?: string;
  subscribe?: string[]; // array of tag IDs
  createdAt?: Date;
  updatedAt?: Date;
}
