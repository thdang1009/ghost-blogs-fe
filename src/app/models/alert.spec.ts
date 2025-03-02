import { Alert, AlertType } from './alert';

describe('Alert', () => {
  it('should create an empty instance', () => {
    const alert = new Alert();
    expect(alert).toBeTruthy();
  });

  it('should initialize with all properties', () => {
    const testData = {
      id: '123',
      type: AlertType.Success,
      message: 'Test message',
      autoClose: true,
      keepAfterRouteChange: false,
      fade: true
    };

    const alert = new Alert(testData);

    expect(alert.id).toBe('123');
    expect(alert.type).toBe(AlertType.Success);
    expect(alert.message).toBe('Test message');
    expect(alert.autoClose).toBe(true);
    expect(alert.keepAfterRouteChange).toBe(false);
    expect(alert.fade).toBe(true);
  });

  it('should allow partial initialization', () => {
    const partialData = {
      message: 'Test message',
      type: AlertType.Warning
    };

    const alert = new Alert(partialData);

    expect(alert.message).toBe('Test message');
    expect(alert.type).toBe(AlertType.Warning);
    expect(alert.id).toBeUndefined();
    expect(alert.autoClose).toBeUndefined();
    expect(alert.keepAfterRouteChange).toBeUndefined();
    expect(alert.fade).toBeUndefined();
  });

  it('should handle all AlertType values', () => {
    expect(AlertType.Success).toBeDefined();
    expect(AlertType.Error).toBeDefined();
    expect(AlertType.Info).toBeDefined();
    expect(AlertType.Warning).toBeDefined();
  });

  it('should create different types of alerts', () => {
    const successAlert = new Alert({ type: AlertType.Success, message: 'Success!' });
    const errorAlert = new Alert({ type: AlertType.Error, message: 'Error!' });
    const infoAlert = new Alert({ type: AlertType.Info, message: 'Info!' });
    const warningAlert = new Alert({ type: AlertType.Warning, message: 'Warning!' });

    expect(successAlert.type).toBe(AlertType.Success);
    expect(errorAlert.type).toBe(AlertType.Error);
    expect(infoAlert.type).toBe(AlertType.Info);
    expect(warningAlert.type).toBe(AlertType.Warning);
  });
});
