import { TodoLabel } from './todo-label';

describe('TodoLabel', () => {
  it('should create an empty instance', () => {
    const todoLabel = new TodoLabel();
    expect(todoLabel).toBeTruthy();
  });

  it('should initialize with all properties', () => {
    const testData = {
      _id: '123',
      id: '456',
      name: 'Test Label',
      description: 'Test Description',
      imgUrl: 'https://example.com/image.jpg',
      imgAlternative: 'Alt Text',
      autoDetectKeywords: 'keyword1,keyword2'
    };

    const todoLabel = Object.assign(new TodoLabel(), testData);

    expect(todoLabel._id).toBe('123');
    expect(todoLabel.id).toBe('456');
    expect(todoLabel.name).toBe('Test Label');
    expect(todoLabel.description).toBe('Test Description');
    expect(todoLabel.imgUrl).toBe('https://example.com/image.jpg');
    expect(todoLabel.imgAlternative).toBe('Alt Text');
    expect(todoLabel.autoDetectKeywords).toBe('keyword1,keyword2');
  });

  it('should allow partial initialization', () => {
    const partialData = {
      name: 'Test Label',
      description: 'Test Description'
    };

    const todoLabel = Object.assign(new TodoLabel(), partialData);

    expect(todoLabel.name).toBe('Test Label');
    expect(todoLabel.description).toBe('Test Description');
    expect(todoLabel._id).toBeUndefined();
    expect(todoLabel.id).toBeUndefined();
    expect(todoLabel.imgUrl).toBeUndefined();
    expect(todoLabel.imgAlternative).toBeUndefined();
    expect(todoLabel.autoDetectKeywords).toBeUndefined();
  });

  it('should handle undefined properties', () => {
    const todoLabel = new TodoLabel();

    expect(todoLabel._id).toBeUndefined();
    expect(todoLabel.id).toBeUndefined();
    expect(todoLabel.name).toBeUndefined();
    expect(todoLabel.description).toBeUndefined();
    expect(todoLabel.imgUrl).toBeUndefined();
    expect(todoLabel.imgAlternative).toBeUndefined();
    expect(todoLabel.autoDetectKeywords).toBeUndefined();
  });
});
