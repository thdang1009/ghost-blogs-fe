import { Tag } from "./_index";


export class Post {
  category?: String[];
  id?: number;
  title?: String;
  author?: String;
  user?: number;
  permission?: String;
  description?: String;
  content?: string; // content
  postReference?: String;
  postImgUrls?: String[];
  postBackgroundImg?: String;
  isPinned?: Boolean;
  tags?: Tag[];
  order?: Number;
  createdAt?: Date;
  updatedAt?: Date;
  clapCount?: Number;
  type?: String;
  contentGhostEditor?: Object;
  readTime?: Number;
  viewCount?: Number;
}
