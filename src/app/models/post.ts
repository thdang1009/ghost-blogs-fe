import { Tag } from './_index';
import { Series } from './series';

export class Post {
  _id?: string;
  category?: String[];
  id?: number;
  title?: string;
  author?: String;
  user?: number;
  permission?: String;
  description?: string;
  content?: string; // content
  alternativeContent?: string; // alternative language content
  postReference?: String;
  postImgUrls?: String[];
  postBackgroundImg?: String;
  isPinned?: Boolean;
  tags?: Tag[];
  series?: Series;
  previousPostId?: Post;
  nextPostId?: Post;
  order?: Number;
  createdAt?: Date;
  updatedAt?: Date;
  clapCount?: Number;
  type?: String;
  contentGhostEditor?: Object;
  readTime?: Number;
  viewCount?: Number;
}
