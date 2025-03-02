import { GuestMessage } from './guest-message';

describe('GuestMessage', () => {
  it('should create an empty instance', () => {
    const message = new GuestMessage();
    expect(message).toBeTruthy();
  });

  it('should set all properties when initialized with data', () => {
    const testData = {
      id: '123',
      message: 'Test message',
      name: 'John Doe',
      subject: 'Test Subject',
      email: 'test@example.com'
    };

    const message = Object.assign(new GuestMessage(), testData);

    expect(message.id).toBe('123');
    expect(message.message).toBe('Test message');
    expect(message.name).toBe('John Doe');
    expect(message.subject).toBe('Test Subject');
    expect(message.email).toBe('test@example.com');
  });

  it('should allow partial initialization of properties', () => {
    const partialData = {
      name: 'John Doe',
      email: 'test@example.com'
    };

    const message = Object.assign(new GuestMessage(), partialData);

    expect(message.name).toBe('John Doe');
    expect(message.email).toBe('test@example.com');
    expect(message.message).toBeUndefined();
    expect(message.subject).toBeUndefined();
    expect(message.id).toBeUndefined();
  });
});
