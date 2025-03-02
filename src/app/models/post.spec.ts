import { Post } from './post';
import { Tag } from './_index';

describe('Post', () => {
  let post: Post;

  beforeEach(() => {
    post = new Post();
  });

  it('should create an instance', () => {
    expect(post).toBeTruthy();
  });

  it('should accept properties during initialization', () => {
    const testPost = new Post();
    testPost.id = 1;
    testPost.title = 'Test Post';
    testPost.author = 'John Doe';
    testPost.content = 'Test Content';
    testPost.description = 'Test Description';
    testPost.postImgUrls = ['http://example.com/image.jpg'];
    testPost.isPinned = false;
    testPost.tags = [new Tag()];
    testPost.clapCount = 0;
    testPost.readTime = 5;

    expect(testPost.id).toBe(1);
    expect(testPost.title).toBe('Test Post');
    expect(testPost.author).toBe('John Doe');
    expect(testPost.content).toBe('Test Content');
    expect(testPost.description).toBe('Test Description');
    expect(testPost.postImgUrls).toContain('http://example.com/image.jpg');
    expect(testPost.isPinned).toBeFalse();
    expect(testPost.tags.length).toBe(1);
    expect(testPost.clapCount).toBe(0);
    expect(testPost.readTime).toBe(5);
  });

  it('should handle dates correctly', () => {
    const testPost = new Post();
    const now = new Date();
    testPost.createdAt = now;
    testPost.updatedAt = now;

    expect(testPost.createdAt).toEqual(now);
    expect(testPost.updatedAt).toEqual(now);
  });
});
