export interface Coupon {
  _id?: string;
  description: string;
  status: 'unused' | 'used';
  usagePurpose?: string;
  partner?: 'A' | 'B';
  createdAt?: Date;
  updatedAt?: Date;
}
