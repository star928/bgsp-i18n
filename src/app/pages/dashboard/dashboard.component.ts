import { formatDate } from "@angular/common";
import {
  Component,
  Inject,
  LOCALE_ID,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from "@angular/core";
import { NgElement, WithProperties } from "@angular/elements";
import { NbDialogService, NbThemeService } from "@nebular/theme";
import * as L from "leaflet";
import { LocalDataSource } from "ng2-smart-table";
import { Subscription } from "rxjs";
import { delay, map } from "rxjs/operators";
import { PoleData } from "../../shared/model/pole.model";
import { PoleService } from "../../shared/service/pole/pole.service";
import { AlarmDialogComponent } from "../alarm-dialog/alarm-dialog.component";
import { PoleLogRequest } from "./../../shared/model/pole-log-request.model";
import { LogData } from "./../../shared/model/pole.model";
import { AlarmService } from "./../../shared/service/alarm/alarm.service";
import { PolePopupComponent } from "./pole-popup/pole-popup.component";

@Component({
  selector: "ngx-dashboard",
  styleUrls: ["./dashboard.component.scss"],
  templateUrl: "./dashboard.component.html",
})
export class DashboardComponent implements OnChanges, OnInit, OnDestroy {
  icon_folder_path = "../../assets/icons/BaoGao_Icon/SVG/";
  light_comsume_icon = this.icon_folder_path + "icon green-04.svg";

  settings = {
    mode: "external",
    hideSubHeader: true,
    noDataMessage: $localize`:@@noData:無資料`,
    actions: {
      columnTitle: $localize`:@@action:操作`,
      add: false,
      edit: false,
      delete: false,
      position: "right",
    },
    columns: {
      date: {
        title: $localize`:@@eventDate:事件日期`,
        type: "string",
        filter: true,
      },
      id: {
        title: $localize`:@@smartPoleNumber:智慧桿編號`,
        type: "string",
        filter: true,
      },
      type: {
        title: $localize`:@@featureType:功能名稱`,
        type: "string",
        filter: true,
      },
      status: {
        title: $localize`:@@status:狀態`,
        type: "string",
        filter: true,
      },
    },
    pager: {
      display: true,
      perPage: 3,
      filter: true,
    },
  };

  source: LocalDataSource = new LocalDataSource();

  poleState: string;

  themeSubscription: Subscription;

  poles$: Subscription;

  alarmList: Array<Object>;
  alarmList$: Subscription;

  // leaflet
  map: L.Map;
  mapOptions: L.MapOptions;
  markers: Array<L.Marker> = [];
  // leaflet

  // echarts
  connection: number = 0;
  broken: number = 0;

  lightOptions: any;
  connectionOptions: any;
  brokenOptions: any;
  airQualityOptions: any;
  energyOptions: any;
  // echarts

  // 照明耗電量
  powerUsed: number;

  // AQI
  logsData$: Subscription;
  singleAQI_point: number;
  singleAQI_value: number;
  totalAQI_point: number = 0;
  totalAQI_value: number = 0;
  airQualityAvg: number;
  airQualityRecord = ["o3", "pm2.5", "pm10", "co", "so2", "no2"];
  airQualityAlarmList: Array<string> = [];

  airQualityStandardValue = [
    [0, 50],
    [50, 100],
    [100, 150],
    [150, 200],
    [200, 300],
    [300, 400],
    [400, 500],
  ];

  airQualityStandardState = [
    $localize`:@@aqi-1:良好`,
    $localize`:@@aqi-2:普通`,
    $localize`:@@aqi-3:對敏感者不健康`,
    $localize`:@@aqi-4:對所有人不健康`,
    $localize`:@@aqi-5:非常不健康`,
    $localize`:@@aqi-6:危害`,
  ];

  airQualityStandard = {
    o3_8hr: [
      [0, 0.054],
      [0.054, 0.07],
      [0.07, 0.085],
      [0.085, 0.105],
      [0.105, 0.2],
    ],
    o3_now: [
      [0, 0],
      [0, 0],
      [0.125, 0.164],
      [0.164, 0.204],
      [0.204, 0.404],
      [0.404, 0.504],
      [0.504, 0.604],
    ],
    "pm2.5": [
      [0, 15.4],
      [15.4, 35.4],
      [35.4, 54.4],
      [54.4, 150.4],
      [150.4, 250.4],
      [250.4, 350.4],
      [350.4, 500.4],
    ],
    pm10: [
      [0, 50],
      [50, 100],
      [100, 254],
      [254, 354],
      [354, 424],
      [424, 504],
      [504, 604],
    ],
    co: [
      [0, 4.4],
      [4.4, 9.4],
      [9.4, 12.4],
      [12.4, 15.4],
      [15.4, 30.4],
      [30.4, 40.4],
      [40.4, 50.4],
    ],
    so2_now: [
      [0, 0.02],
      [0.02, 0.075],
      [0.075, 0.185],
    ],
    so2_24hr: [
      [0, 0],
      [0, 0],
      [0, 0],
      [0.186, 0.304],
      [0.304, 0.604],
      [0.604, 0.804],
      [0.804, 1.004],
    ],
    no2: [
      [0, 0.03],
      [0.03, 0.1],
      [0.1, 0.36],
      [0.36, 0.649],
      [0.649, 1.249],
      [1.249, 1.649],
      [1.649, 2.049],
    ],
  };

  polesData: Array<PoleData>;
  logsData: Array<LogData>;

  constructor(
    private theme: NbThemeService,
    private dialogService: NbDialogService,
    private poleService: PoleService,
    private alarmService: AlarmService,
    @Inject(LOCALE_ID) private locale: string
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["polesData"]) {
      this.resetMap();
      for (let poleData of this.polesData) {
        this.createMarker(poleData);
      }
      // echarts
      this.createConnectionGauge();
      this.createBrokenGauge();
    }
  }

  ngOnInit(): void {
    // SmartPole
    this.getPoleData();
    this.getAlarmList();

    //Map
    this.setMap();
  }

  ngOnDestroy(): void {
    if (this.alarmList$) {
      this.alarmList$.unsubscribe();
    }
    if (this.poles$) {
      this.poles$.unsubscribe();
    }
  }

  setPolesData(): void {
    this.poles$ = this.poleService.polesData$.subscribe((data) => {
      this.polesData = data;
    });
  }

  // 智慧桿基本資料
  getPoleData(): void {
    this.poles$ = this.poleService.getPolesData().subscribe((data) => {
      this.polesData = data;
      this.resetData();
      this.resetMap();
      for (let poleData of this.polesData) {
        this.createMarker(poleData);
      }
      // echarts
      this.createConnectionGauge();
      this.createBrokenGauge();
      // Power
      this.getEnergyData();
      // AQI
      this.getAQIData();
    });
  }

  resetData(): void {
    this.connection = 0;
    this.broken = 0;
    this.powerUsed = 0;
  }

  resetMap(): void {
    if (this.markers?.length > 0) {
      for (let marker of this.markers) {
        this.map.removeLayer(marker);
      }
      this.markers = [];
    }
  }
  // Leaflet Start
  setMap(): void {
    this.mapOptions = {
      layers: [
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
          attribution:
            '© <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
        }),
      ],
      zoom: 18,
      center: L.latLng({ lat: 24.97644, lng: 121.55066 }),
      attributionControl: false,
    };
  }

  getPoleList(): Array<Object> {
    let poleList: Array<Object> = [];
    this.polesData.forEach((poleData) =>
      poleList.push({ title: poleData.number, value: poleData.number })
    );
    return poleList;
  }

  getAlarmList(): void {
    this.alarmList$ = this.alarmService.alarmList$.subscribe((alarmList) =>
      this.source.load(alarmList)
    );
  }

  openAlarmDialog(): void {
    this.dialogService
      .open(AlarmDialogComponent, {
        context: {
          poleList: this.getPoleList(),
        },
      })
      .onClose.subscribe();
  }

  onMapReady(map: L.Map) {
    this.map = map;
    this.map.addControl(L.control.attribution({ position: "topright" }));
  }

  setMarkerColor(color: string): L.MarkerOptions {
    return {
      icon: L.icon({
        iconSize: [48, 48],
        iconAnchor: [24, 48],
        popupAnchor: [0, -48],
        iconUrl: `../../../assets/icons/marker/marker_${color}_2.png`,
      }),
    };
  }

  checkConnection(poleData: PoleData): boolean {
    if (
      (poleData.light_show &&
        poleData.light_show === "offline" &&
        (this.alarmService.isLegalLightTime(poleData.light_show_time) ||
          !this.alarmService.isLatestRecord(poleData.light_show_time))) ||
      (poleData.environment_show && poleData.environment_show === "offline") ||
      (poleData.player_show && poleData.player_show === "offline") ||
      (poleData.solar_show && poleData.solar_show === "offline") ||
      (poleData.holder_show && poleData.holder_show === "offline")
    ) {
      return false;
    } else {
      return true;
    }
  }

  checkBroken(poleData: PoleData): boolean {
    if (
      (poleData.environment_connect &&
        poleData.environment_connect === "off") ||
      (poleData.player_connect && poleData.player_connect === "off") ||
      (poleData.solar_connect && poleData.solar_connect === "off") ||
      (poleData.holder_connect && poleData.holder_connect === "off")
    ) {
      // ++this.broken;
      return false;
    } else {
      return true;
    }
  }

  createMarker(poleData: PoleData): void {
    let markerColor: string;

    if (!this.checkConnection(poleData)) {
      ++this.broken;
      markerColor = "red";
    } else {
      ++this.connection;
      if (!this.checkBroken(poleData)) {
        ++this.broken;
        markerColor = "yellow";
      } else {
        markerColor = "green";
      }
    }
    this.markers.push(
      L.marker(
        [poleData.geoLocation["lat"], poleData.geoLocation["lng"]],
        this.setMarkerColor(markerColor)
      )
        .bindPopup(
          () => {
            const popupEl: NgElement & WithProperties<PolePopupComponent> =
              document.createElement("popup-element") as any;
            popupEl.poleData = poleData;
            return popupEl;
          },
          { maxWidth: 1000 }
        )
        .addTo(this.map)
    );
  }

  // Leaflet End

  // PowerUsed Start

  // // 當月耗電量 ( 逐日累計 )
  // getEnergyData(): void {
  //   this.powerUsed = 0;
  //   let now = new Date();
  //   let request = new PoleLogRequest();
  //   request.scope = "day";
  //   request.time_start =
  //     formatDate(now, "YYYY-MM", this.locale) + "-01 00:00:00";
  //   request.time_end = formatDate(now, "YYYY-MM-dd", this.locale) + " 23:59:59";
  //   request.type = "light";
  //   request.record = "e";
  //   this.logsData$ = this.poleService
  //     .getPoleLogsData(request)
  //     .pipe()
  //     .subscribe((data) => {
  //       data.forEach((poleLog) =>
  //         poleLog?.log.forEach((log) => {
  //           if (log?.array?.length > 0) {
  //             log.array.forEach(
  //               (powerUsed) => (this.powerUsed += Number(powerUsed[1]))
  //             );
  //           }
  //         })
  //       );
  //     });
  // }

  // 當月耗電量 ( 逐小時累計 )
  getEnergyData(): void {
    let now = new Date();
    let request = new PoleLogRequest();
    request.scope = "hour";
    request.time_start =
      formatDate(now, "YYYY-MM", this.locale) + "-01 00:00:00";
    request.time_end =
      formatDate(now, "YYYY-MM-dd hh", this.locale) + " :59:59";
    request.type = "light";
    request.record = "e";
    this.logsData$ = this.poleService
      .getPoleLogsData(request)
      .pipe()
      .subscribe((data) => {
        data.forEach((poleLog) =>
          poleLog?.log.forEach((log) => {
            if (log?.array?.length > 0) {
              log.array.forEach((powerUsed) => {
                this.powerUsed += Number(powerUsed[1]);
              });
            }
          })
        );
      });
  }

  // 過去一個月耗電量
  /*
  getEnergyData(): void {
    this.powerUsed = 0;
    let now = new Date();
    let request = new PoleLogRequest();
        request.scope = "hour";
    request.time_start = formatDate(this.diffMonth(now.getTime()), 'YYYY-MM-dd HH', this.locale) + ':00:00';
    request.time_end = formatDate(now, 'YYYY-MM-dd HH', this.locale) + ':00:00';
    request.type = 'light';
    request.record = 'e';
    this.logsData$ = this.poleService.getPoleLogsData(request).pipe().subscribe(
      data => {
        this.powerLogs = data;
        data.forEach(poleLog => poleLog?.log.forEach(log => {
          if (log?.array?.length > 0) {
            log.array.forEach(powerUsed => this.powerUsed += Number(powerUsed[1]));
          }
        }))
      });
  }
  */

  diffMonth(date: number): number {
    return new Date(date).setMonth(new Date(date).getMonth() - 1);
  }

  // PowerUsed End

  // AQI Start
  getAQIData(): void {
    let poleData = this.polesData.find(
      (poleData) => poleData.environment_enable
    );
    let request = new PoleLogRequest();
    let now = new Date();
    request.scope = "hour";
    request.time_start =
      formatDate(now.getTime() - 86400000, "YYYY-MM-dd HH", this.locale) +
      ":00:00";
    request.time_end = formatDate(now, "YYYY-MM-dd HH", this.locale) + ":00:00";
    request.uuid = poleData
      ? poleData.uuid
      : "9e2e0fe3-878a-409f-8e12-d4d6794b1429";
    request.type = "environment";
    this.logsData$ = this.poleService
      .getPoleLogsData(request)
      .pipe(map((data) => data[0].log))
      .subscribe((data) => {
        this.logsData = data;
        if (data.length > 0) {
          this.airQualityRecord.forEach((record) =>
            this.airQualityCalculate(
              record,
              data.find((log) => log.record === record)
            )
          );
          this.createAirQualityGauge(this.totalAQI_value);
        } else {
          this.createAirQualityGauge(0);
        }
      });
  }
  logDataSum(hour: number, logData: LogData, record?: string): void {
    if (record?.startsWith("pm")) {
      let sum_12 = 0;
      let sum_4 = 0;
      logData.array.slice(0, hour).forEach((log) => {
        sum_12 += Number(log[1]);
      });
      logData.array.slice(0, 4).forEach((log) => (sum_4 += Number(log[1])));
      this.airQualityAvg =
        record === "pm2.5"
          ? Math.round(((sum_12 / 12 + sum_4 / 4) / 2) * 100) / 100
          : Math.round(((sum_12 / 12 + sum_4 / 4) / 2) * 10) / 10;
    } else {
      let sum = 0;
      logData.array.slice(0, hour).forEach((log) => (sum += Number(log[1])));
      this.airQualityAvg =
        record === "o3_8hr" ? Math.round((sum / hour) * 10) / 10 : sum / hour;
    }
  }
  findAQI(record: string): void {
    this.singleAQI_point = this.airQualityStandard[record].findIndex(
      (data: Array<number>) =>
        this.airQualityAvg >= data[0] && this.airQualityAvg <= data[1]
    );
    if (this.singleAQI_point > this.totalAQI_point) {
      this.airQualityAlarmList = [record.split("_")[0]];
    } else if (
      this.singleAQI_point === this.totalAQI_point &&
      this.singleAQI_point > 0
    ) {
      this.airQualityAlarmList.push(record.split("_")[0]);
    }
    this.totalAQI_point = Math.max(this.totalAQI_point, this.singleAQI_point);
  }
  ArrayDiff(Array: Array<number>): number {
    return Array[1] - Array[0];
  }
  findAQIValue(record: string) {
    let standardValueDiff = this.ArrayDiff(
      this.airQualityStandardValue[this.singleAQI_point]
    );
    let standardDiff = this.ArrayDiff(
      this.airQualityStandard[record][this.singleAQI_point]
    );

    //                         AQI值 = AQI值差 / AQI標準差( 頂標 - 底標 ) * ( 觀測平均值 - 標準底標 ) + AQI值起始值
    // ex: O3_8hr = 0.037 → AQIValue = ( 50 - 0 ) / ( 0.054 - 0 ) * ( 0.037 - 0 ) + 0 = 34.26: 良好
    if (this.airQualityAvg > 0) {
      this.singleAQI_value =
        (standardValueDiff / standardDiff) *
        (this.airQualityAvg -
          this.airQualityStandard[record][this.singleAQI_point][0]) +
        this.airQualityStandardValue[this.singleAQI_point][0];
    } else {
      this.singleAQI_value = 0;
    }
    // AQI值比較 & 四捨五入
    this.totalAQI_value = Math.round(
      Math.max(this.totalAQI_value, this.singleAQI_value)
    );
  }
  airQualityCalculate(record: string, logData: LogData): void {
    if (logData) {
      // o3 index 1 - 5 (8hr)
      if (record === "o3") {
        this.logDataSum(8, logData);
        this.findAQI(record + "_8hr");
        this.findAQIValue(record + "_8hr");
        // o3 index 6 - 7 (now)
        if (
          this.singleAQI_point < 0 ||
          Number(logData.array[0][1]) > this.airQualityStandard["o3_now"][3][0]
        ) {
          this.airQualityAvg = Number(logData.array[0][1]);
          this.findAQI(record + "_now");
          this.findAQIValue(record + "_now");
        }
        // so2 index 1 - 3 (now)
      } else if (record === "so2") {
        this.airQualityAvg = Number(logData.array[0][1]);
        this.findAQI(record + "_now");
        this.findAQIValue(record + "_now");
        if (this.singleAQI_point < 0) {
          // so2 index 4 - 7 (24hr)
          this.logDataSum(24, logData);
          this.findAQI(record);
          this.findAQIValue(record);
        }
        // pm2.5 & pm10 (0.5 * 12hr + 0.5 * 4hr)
      } else if (record === "pm2.5" || record === "pm10") {
        this.logDataSum(12, logData, record);
        this.findAQI(record);
        this.findAQIValue(record);
        // no2 (now)
      } else if (record === "no2") {
        this.airQualityAvg = Number(logData.array[0][1]);
        this.findAQI(record);
        this.findAQIValue(record);
      }

      // co (8hr)
      else {
        this.logDataSum(8, logData);
        this.findAQI(record);
        this.findAQIValue(record);
      }
    }
    // console.log(
    //   "汙染物: " +
    //     record +
    //     ", 平均值: " +
    //     this.airQualityAvg +
    //     ", AQI指標: " +
    //     this.singleAQI_point +
    //     ", AQI值: " +
    //     this.singleAQI_value
    // );
    // console.log(
    //   "總AQI指標: " + this.totalAQI_point + ", 總AQI值: " + this.totalAQI_value
    // );
  }

  // AQI End

  // // AQI_Daily Start

  // getAQIData(): void {
  //   let poleData = this.polesData.find(
  //     (poleData) => poleData.environment_enable
  //   );
  //   let request = new PoleLogRequest();
  //   let now = new Date();
  //   request.scope = "hour";
  //   request.time_start = formatDate(now.getTime() - 86400000, "YYYY-MM-dd HH", this.locale) + ":00:00";
  //   request.time_end = formatDate(now, "YYYY-MM-dd HH", this.locale) + ":00:00";
  //   request.uuid = poleData ? poleData.uuid : "9e2e0fe3-878a-409f-8e12-d4d6794b1429";
  //   request.type = "environment";
  //   this.logsData$ = this.poleService
  //     .getPoleLogsData(request)
  //     .pipe(map((data) => data[0].log))
  //     .subscribe((data) => {
  //       this.logsData = data;
  //       if (data.length > 0) {
  //         this.airQualityRecord.forEach((record) =>
  //           this.airQualityCalculate(
  //             record,
  //             data.find((log) => log.record === record)
  //           )
  //         );
  //         this.createAirQualityGauge(this.totalAQI_value);
  //       } else {
  //         this.createAirQualityGauge(0);
  //       }
  //     });
  // }
  // logDataSum(hour: number, logData: LogData): void {
  //   let sum = 0;
  //   logData.array
  //     .slice(0, hour)
  //     .forEach((log) => (sum += Number(log[1])));
  //   this.airQualityAvg = sum / hour;
  // }
  // findAQI(record: string): void {
  //   this.singleAQI_point = this.airQualityStandard[record].findIndex(
  //     (data: Array<number>) =>
  //       this.airQualityAvg >= data[0] && this.airQualityAvg <= data[1]
  //   );
  //   this.totalAQI_point = Math.max(this.totalAQI_point, this.singleAQI_point);
  // }
  // ArrayDiff(Array: Array<number>): number {
  //   return Array[1] - Array[0];
  // }
  // findAQIValue(record: string) {
  //   let standardValueDiff = this.ArrayDiff(
  //     this.airQualityStandardValue[this.singleAQI_point]
  //   );
  //   let standardDiff = this.ArrayDiff(
  //     this.airQualityStandard[record][this.singleAQI_point]
  //   );
  //   //                         AQI值 = AQI值差 / AQI標準差( 頂標 - 底標 ) * ( 觀測平均值 - 標準底標 ) + AQI值起始值
  //   // ex: O3_8hr = 0.037 → AQIValue = ( 50 - 0 ) / ( 0.054 - 0 ) * ( 0.037 - 0 ) + 0 = 34.26: 良好
  //   this.singleAQI_value =
  //     (standardValueDiff / standardDiff) *
  //     (this.airQualityAvg -
  //       this.airQualityStandard[record][this.singleAQI_point][0]) +
  //     this.airQualityStandardValue[this.singleAQI_point][0];
  //   // AQI值比較 & 四捨五入
  //   this.totalAQI_value = Math.round(
  //     Math.max(this.totalAQI_value, this.singleAQI_value)
  //   );
  // }
  // airQualityCalculate(record: string, logData: LogData): void {
  //   if (logData) {
  //     // o3 index 1 - 5 (8hr)
  //     if (record === "o3") {
  //       this.logDataSum(8, logData);
  //       this.findAQI(record + "_8hr");
  //       this.findAQIValue(record + "_8hr");
  //       // o3 index 6 - 7 (1hr)
  //       if (this.singleAQI_point < 0 || Number(logData.array[0][1]) > this.airQualityStandard['o3_now'][3][0]) {
  //         this.airQualityAvg = Number(logData.array[0][1]);
  //         this.findAQI(record + "_now");
  //         this.findAQIValue(record + "_now");
  //       }
  //       // so2 index 1 - 3 (1hr)
  //     } else if (record === "so2") {
  //       this.airQualityAvg = Number(logData.array[0][1]);
  //       this.findAQI(record + "_now");
  //       if (this.singleAQI_point >= 0) {
  //         this.findAQI(record + "_now");
  //         // so2 index 4 - 7 (24hr)
  //       } else {
  //         this.logDataSum(24, logData);
  //         this.findAQI(record);
  //         this.findAQIValue(record);
  //       }
  //       // pm2.5 & pm10 (24hr)
  //     } else if (record === "pm2.5" || record === "pm10") {
  //       this.logDataSum(24, logData);
  //       this.findAQI(record);
  //       this.findAQIValue(record);
  //       // no2 (1hr)
  //     } else if (record === "no2") {
  //       this.airQualityAvg = Number(logData.array[0][1]);
  //       this.findAQI(record);
  //       this.findAQIValue(record);
  //     }
  //     // co (8hr)
  //     else {
  //       this.logDataSum(8, logData);
  //       this.findAQI(record);
  //       this.findAQIValue(record);
  //     }
  //     console.log(
  //       "汙染物: " +
  //       record +
  //       ", 平均值: " +
  //       this.airQualityAvg +
  //       ", AQI指標: " +
  //       this.singleAQI_point +
  //       ", AQI值: " +
  //       this.singleAQI_value
  //     );
  //     console.log(
  //       "總AQI指標: " + this.totalAQI_point + ", 總AQI值: " + this.totalAQI_value
  //     );
  //   }
  // }

  // // AQI_Daily End

  createConnectionGauge(): void {
    this.themeSubscription = this.theme
      .getJsTheme()
      .pipe(delay(1))
      .subscribe((config) => {
        const colors = config.variables;
        const solarTheme: any = config.variables.solar;

        this.connectionOptions = Object.assign(
          {},
          {
            tooltip: {
              trigger: "item",
              formatter: "{a} <br/>{b} : {c} ({d}%)",
            },
            series: [
              {
                name: $localize`:@@smartPole:智慧桿`,
                clockwise: true,
                type: "pie",
                emphasis: {
                  scale: true,
                },
                center: ["50%", "50%"],
                radius: solarTheme.radius,
                data: [
                  {
                    value: (this.connection / this.polesData.length) * 100,
                    name: $localize`:@@connRate:連線率`,
                    label: {
                      position: "center",
                      formatter: "{d}%",
                      fontSize: "14",
                      fontFamily: config.variables.fontSecondary,
                      fontWeight: "600",
                      color: config.variables.fgHeading,
                    },
                    tooltip: {
                      show: true,
                    },
                    itemStyle: {
                      color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        {
                          offset: 0,
                          color: "#34A853",
                        },
                        {
                          offset: 1,
                          color: solarTheme.gradientRight,
                        },
                      ]),
                      shadowColor: solarTheme.shadowColor,
                      shadowBlur: 7,
                    },
                    emphasis: {
                      scale: true,
                    },
                  },
                  {
                    value:
                      100 - (this.connection / this.polesData.length) * 100,
                    label: {
                      position: "inner",
                      show: false,
                    },
                    tooltip: {
                      show: false,
                    },
                    itemStyle: {
                      color: solarTheme.secondSeriesFill,
                    },
                    emphasis: {
                      scale: true,
                    },
                  },
                ],
              },
            ],
          }
        );
      });
  }

  createBrokenGauge(): void {
    this.themeSubscription = this.theme
      .getJsTheme()
      .pipe(delay(1))
      .subscribe((config) => {
        const colors = config.variables;
        const solarTheme: any = config.variables.solar;

        this.brokenOptions = Object.assign(
          {},
          {
            tooltip: {
              trigger: "item",
              formatter: "{a} <br/>{b} : {c} ({d}%)",
            },
            series: [
              {
                name: $localize`:@@smartPole:智慧桿`,
                clockwise: true,
                emphasis: {
                  scale: true,
                },
                type: "pie",
                center: ["50%", "50%"],
                radius: solarTheme.radius,
                data: [
                  {
                    value: (this.broken / this.polesData.length) * 100,
                    name: $localize`:@@failureRate:異常率`,
                    label: {
                      position: "center",
                      formatter: "{d}%",
                      fontSize: "14",
                      fontFamily: config.variables.fontSecondary,
                      fontWeight: "600",
                      color: config.variables.fgHeading,
                    },
                    tooltip: {
                      show: true,
                    },
                    itemStyle: {
                      color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        {
                          offset: 0,
                          color: "#EA4335",
                        },
                        {
                          offset: 1,
                          color: solarTheme.gradientRight,
                        },
                      ]),
                      shadowColor: solarTheme.shadowColor,
                      shadowBlur: 7,
                    },
                    emphasis: {
                      scale: true,
                    },
                  },
                  {
                    value: 100 - (this.broken / this.polesData.length) * 100,
                    label: {
                      position: "inner",
                      show: false,
                    },
                    tooltip: {
                      show: false,
                    },
                    itemStyle: {
                      color: solarTheme.secondSeriesFill,
                    },
                    emphasis: {
                      scale: true,
                    },
                  },
                ],
              },
            ],
          }
        );
      });
  }

  createAirQualityGauge(totalAQIValue: number): void {
    this.themeSubscription = this.theme
      .getJsTheme()
      .pipe(delay(1))
      .subscribe((config) => {
        let fontsize = 18; //16
        this.airQualityOptions = Object.assign(
          {},
          {
            grid: {
              top: 0,
              right: 0,
              left: 0,
              bottom: 0,
            },
            series: [
              {
                name: "AQI",
                radius: "100%",
                type: "gauge",
                startAngle: 180,
                endAngle: 0,
                min: 0,
                max: 500,
                center: ["50%", "66%"],
                axisLine: {
                  show: true,
                  lineStyle: {
                    width: 50,
                    shadowBlur: 0,
                    color: [
                      [0.1, "#00e400"],
                      [0.2, "#ffff00"],
                      [0.3, "#ff7d00"],
                      [0.4, "#ff0000"],
                      [0.6, "#99004c"],
                      [1.0, "#7e0022"],
                    ],
                  },
                },
                axisTick: {
                  show: false,
                  splitNumber: 1,
                },
                splitLine: {
                  show: false,
                  length: 15,
                },
                axisLabel: {
                  color: "inherit",
                  formatter: function (e: any) {
                    switch (e + "") {
                      default:
                        return "";
                    }
                  },
                  textBorderColor: "#fff",
                  textBorderWidth: 2,
                  distance: -30,
                  fontSize: 10,
                  fontWeight: "",
                },
                detail: {
                  valueAnimation: true,
                  width: "60%",
                  lineHeight: 40,
                  borderRadius: 7,
                  fontSize: fontsize,
                  fontWeight: "bolder",
                  formatter: () => {
                    return this.airQualityStandardState[this.totalAQI_point];
                  },
                  color: "inherit",
                },
                pointer: {
                  show: true,
                  width: 3,
                  length: "80%",
                  itemStyle: {
                    color: "#000",
                  },
                },
                data: [
                  {
                    value: totalAQIValue,
                  },
                ],
              },
            ],
          }
        );
      });
  }
}
