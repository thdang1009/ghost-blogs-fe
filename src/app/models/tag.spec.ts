import { Tag } from './tag';

describe('Tag', () => {
  let tag: Tag;

  beforeEach(() => {
    tag = new Tag();
  });

  it('should create an instance', () => {
    expect(tag).toBeTruthy();
  });

  it('should accept properties during initialization', () => {
    const testTag = new Tag();
    testTag._id = '1';
    testTag.id = '1';
    testTag.name = 'Test Tag';
    testTag.description = 'Test Description';
    testTag.imgUrl = 'http://example.com/image.jpg';
    testTag.content = 'Test Content';

    expect(testTag._id).toBe('1');
    expect(testTag.name).toBe('Test Tag');
    expect(testTag.description).toBe('Test Description');
    expect(testTag.imgUrl).toBe('http://example.com/image.jpg');
    expect(testTag.content).toBe('Test Content');
  });
});
