import { Category } from './category';

describe('Category', () => {
  let category: Category;

  beforeEach(() => {
    category = new Category();
  });

  it('should create an instance', () => {
    expect(category).toBeTruthy();
  });

  it('should accept properties during initialization', () => {
    const testCategory = new Category();
    testCategory._id = '1';
    testCategory.id = '1';
    testCategory.name = 'Test Category';
    testCategory.description = 'Test Description';
    testCategory.imgUrl = 'http://example.com/image.jpg';
    testCategory.content = 'Test Content';

    expect(testCategory._id).toBe('1');
    expect(testCategory.id).toBe('1');
    expect(testCategory.name).toBe('Test Category');
    expect(testCategory.description).toBe('Test Description');
    expect(testCategory.imgUrl).toBe('http://example.com/image.jpg');
    expect(testCategory.content).toBe('Test Content');
  });
});
