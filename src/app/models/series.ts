import { Tag } from './tag';

export interface Series {
  id?: number;
  _id?: string;
  name: string;
  description?: string;
  imageUrl?: string;
  baseTags?: Tag[];
  slug?: string;
  active?: boolean;
  createdBy?: number;
  updatedBy?: number;
  createdAt?: Date;
  updatedAt?: Date;
}
