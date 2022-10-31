export class DeviceData {
  name: string;
  iconPath: string;
  state: string;
  constructor(
    name: string,
    iconPath: string,
    state: string
  ) {
    this.name = name;
    this.iconPath = iconPath;
    this.state = state;
  }
}
