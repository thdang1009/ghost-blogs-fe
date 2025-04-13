export interface Coupon {
  _id?: string;
  description: string;
  status: 'unused' | 'used';
  usagePurpose?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
