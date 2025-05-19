export interface Reward {
  _id?: string;
  description: string;
  couponCost?: number;
  status: 'Pending' | 'Approved' | 'Rejected';
  requestedBy?: string;
  partner?: 'A' | 'B';
  createdAt?: Date;
  updatedAt?: Date;
}
