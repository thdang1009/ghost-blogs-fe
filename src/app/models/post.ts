import { Tag } from './_index';
import { Series } from './series';

export class Post {
  _id?: string;
  category?: string[];
  id?: number;
  title?: string;
  author?: string;
  user?: number;
  permission?: string;
  description?: string;
  content?: string;
  alternativeContent?: string;
  postReference?: string;
  postImgUrls?: string[];
  postBackgroundImg?: string;
  isPinned?: boolean;
  tags?: Tag[];
  series?: Series;
  previousPostId?: Post;
  nextPostId?: Post;
  order?: number;
  createdAt?: Date;
  updatedAt?: Date;
  clapCount?: number;
  type?: string;
  contentGhostEditor?: Record<string, unknown>;
  readTime?: number;
  viewCount?: number;
}
