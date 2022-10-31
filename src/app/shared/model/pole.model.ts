export class PoleManageData {
  passwd: string;
  uuid: string;
  birth: string;
  location: Array<Map<string, Array<Map<string, Array<string>>>>>; // 地區
  address: string; // 未使用
  geoLocation: Object; // 座標
  number: string; // ID number
  enable: boolean | string;
  light_control: string; // schedule, on, off
  light_dimming: number; //  亮度(ON) 0 - 100 ( % )
  light_enable: boolean | string;
  light_username: string; // 照明 username
  light_passwd: string; // 照明 password
  light_schedule: Array<string>; // 照明排程
  environment_enable: boolean | string;
  player_enable: boolean | string;
  player_schedule: Array<Object>; // 播放器排程
  player_screen: string; // on, off
  solar_enable: boolean | string;
}

export class PoleData {
  passwd: string;
  uuid: string;
  birth: string;
  location: Array<Map<string, Array<Map<string, Array<string>>>>>; // 地區
  address: string; // 未使用
  geoLocation: Object; // 座標
  number: string; // ID number
  enable: boolean | string;
  light_enable: boolean | string;
  light_username: string; // 照明帳號
  light_passwd: string; // 照明密碼
  light_dimming: number; //  亮度(ON) 0 - 100 ( % )
  light_schedule: Array<string>; // 照明排程
  light_control: string; // schedule, on, off
  light_show: string;
  light_show_time: string; // YYYY-MM-dd hh:mm:ss
  light_record_time: string; // YYYY-MM-dd hh:mm:ss
  b: number; // 亮度 %
  v: number; // 電壓 V
  c: number; // 電流 mA
  p: number; // 功率 W
  e: number; // 功耗 Wh
  environment_enable: boolean | string;
  environment_show: string; // 環境感測 連線狀態 online/offline
  environment_connect: string;
  environment_connect_time: string;
  environment_show_time: string; // 環境感測 上線時間
  environment_record_time: string; // 環境感測 最後回報時間
  t: number; // 溫度 °C
  rh: number; // 濕度 %
  co: number; // CO
  pm10: number; // PM10
  "pm2.5": number; // PM2.5
  o3: number; // O3
  no2: number; // NO2
  so2: number; // SO2
  player_enable: boolean | string;
  player_show: string; // online, offline
  player_show_time: string; // YYYY-MM-dd hh:mm:ss
  player_connect: string; // on, off
  player_connect_time: string; // YYYY-MM-dd hh:mm:ss
  player_file: string;
  player_file_time: string; // YYYY-MM-dd hh:mm:ss
  player_screen: string; // on, off
  player_schedule: Array<Object>; // 播放器排程
  solar_enable: boolean | string;
  solar_show: string;
  solar_show_time: string;
  solar_connect: string;
  solar_connect_time: string;
  solar_record_time: string;
  ai: number; // 充電電流 A
  vi: number; // 充電電壓 V
  pi: number; // 充電功率 W
  ei: number; // 充電功耗 Wh
  ao: number; // 放電電流 A
  vo: number; // 放電電壓 V
  po: number; // 放電功率 W
  eo: number; // 放電功耗 Wh
  bc: number; // 電量 %
  bt: number; // 電池溫度 °C
  holder_show: string;
  holder_show_time: string;
  holder_connect: string;
  holder_connect_time: string;
  holder_record_time: string;
  hd: string; // 箱門狀態
  ht: number; // 箱內溫度 °C
  hh: number; // 箱內濕度 °C
}

export class PoleLog {
  uuid: string;
  log: Array<LogData>;
}

export class LogData {
  type: string;
  record: string;
  array: Array<Array<string>>;
}
