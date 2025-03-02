export class Alert {
  id?: String;
  type?: AlertType;
  message?: String;
  autoClose?: Boolean;
  keepAfterRouteChange?: Boolean;
  fade?: Boolean;

  constructor(init?: Partial<Alert>) {
    Object.assign(this, init);
  }
}

export enum AlertType {
  Success,
  Error,
  Info,
  Warning
}
