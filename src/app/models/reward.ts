export interface Reward {
  _id?: string;
  description: string;
  couponCost?: number;
  status: 'Pending' | 'Approved' | 'Rejected';
  requestedBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
