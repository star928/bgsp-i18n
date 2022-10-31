export class DigitalSignage {
  id: string;
  updatable: boolean;
  publishable: boolean;
  page: string;
  interval: number;
  source: Array<SignageSourcce>;
  constructor(
    id: string,
    updatable?: boolean,
    publishable?: boolean,
    page?: string,
    interval?: number,
    source?: Array<SignageSourcce>
  ) {
    this.id = id;
    this.updatable = updatable;
    this.publishable = publishable;
    this.page = page;
    this.interval = interval;
    this.source = source;
  }
}

export class SignageSourcce {
  id: string;
  file: Array<SourceMedia>;
  text: string;
  constructor() {}
}

export class SourceMedia {
  id: string;
  uuid: string;
  constructor() {}
}
