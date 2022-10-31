export const LIGHT_ALARM = {
  v: { type: "range10", value: "220", unit: "V" },
  c: { type: "range5", value: "420", unit: "mA" },
  p: { type: "range10", value: "90", unit: "W" },
  light_show: { type: "match", value: "offline", unit: "" },
};

export const ENVIRONMENT_ALARM = {
  environment_show: { type: "match", value: "offline", unit: "" },
  environment_connect: { type: "match", value: "off", unit: "" },
};

export const SOLAR_ALARM = {
  bt: { type: "max", value: "55", unit: "°C" },
  bc: { type: "min", value: "10", unit: "%" },
  solar_show: { type: "match", value: "offline", unit: "" },
  solar_connect: { type: "match", value: "off", unit: "" },
};

export const PLAYER_ALARM = {
  player_show: { type: "match", value: "offline", unit: "" },
  player_connect: { type: "match", value: "off", unit: "" },
};

export const HOLDER_ALARM = {
  hh: { type: "max", value: "90", unit: "%" },
  hd: { type: "match", value: "open", unit: "" },
  holder_show: { type: "match", value: "offline", unit: "" },
  holder_connect: { type: "match", value: "off", unit: "" },
};

export const ALARM_STANDARD = {
  v: { type: "range10", value: "220", unit: "V" },
  c: { type: "range5", value: "420", unit: "mA" },
  p: { type: "range10", value: "90", unit: "W" },
};

export const ALARM_MAXIMUM = {
  bt: { type: "max", value: "55", unit: "°C" },
  hh: { type: "max", value: "90", unit: "%" },
};

export const ALARM_MINIMUM = {
  bc: { type: "min", value: "10", unit: "%" },
};

export const TYPE = {
  light: $localize`:@@smartLight:智慧照明`,
  environment: $localize`:@@environment:環境感測`,
  player: $localize`:@@digitalSignage:數位看板`,
  solar: $localize`:@@solar:儲能系統`,
  holder: $localize`:@@holder:箱體狀態`,
};

export const ALARM_RECORD = {
  v: $localize`:@@voltage:電壓`,
  c: $localize`:@@current:電流`,
  p: $localize`:@@power:功率`,
  bc: $localize`:@@bc:電量`,
  bt: $localize`:@@bt:電池溫度`,
  hh: $localize`:@@hh:箱內濕度`,
  hd: $localize`:@@hdoor:箱門`,
  show: $localize`:@@show:連線狀態`,
  connect: $localize`:@@connect:設備狀態`,
};

export const TYPE_FILTER = [
  { title: $localize`:@@smartLight:智慧照明`, value: $localize`:@@smartLight:智慧照明` },
  { title: $localize`:@@environment:環境感測`, value: $localize`:@@environment:環境感測` },
  { title: $localize`:@@digitalSignage:數位看板`, value: $localize`:@@digitalSignage:數位看板` },
  { title: $localize`:@@solar:儲能系統`, value: $localize`:@@solar:儲能系統` },
  { title: $localize`:@@holder:箱體狀態`, value: $localize`:@@holder:箱體狀態` },
];
