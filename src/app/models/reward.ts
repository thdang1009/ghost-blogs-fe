export interface Reward {
  _id?: string;
  description: string;
  couponCost?: number;
  status: 'pending' | 'done';
  requestedBy?: string;
  partner?: 'A' | 'B';
  createdAt?: Date;
  updatedAt?: Date;
}
