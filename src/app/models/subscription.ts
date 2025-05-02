export class Subscription {
  _id?: string;
  userId?: string;
  email?: string;
  subscribe?: string[]; // array of tag IDs
  createdAt?: Date;
  updatedAt?: Date;
}

export class SubscriptionDisplay {
  _id?: string;
  tagId?: string;
  name?: string;
  subscribers?: {
    _id: string;
    email: string;
  }[];
  subscribersDisplay?: string[];
}
