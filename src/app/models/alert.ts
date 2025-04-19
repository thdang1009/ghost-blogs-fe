export class Alert {
  id?: String;
  type?: AlertType;
  message?: String;
  autoClose?: Boolean;
  keepAfterRouteChange?: Boolean;
  fade?: Boolean;
  title?: String;
  timer?: number;
  position?: {
    from: string;
    align: string;
  };

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
