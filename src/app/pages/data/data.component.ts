import { AlarmService } from "./../../shared/service/alarm/alarm.service";
import { interval, Subscription } from "rxjs";
import { formatDate } from "@angular/common";
import { Component, Inject, LOCALE_ID, OnInit, OnDestroy } from "@angular/core";
import { NbDialogService, NbThemeService } from "@nebular/theme";
import { PoleLogRequest } from "../../shared/model/pole-log-request.model";
import { PoleData, PoleLog } from "../../shared/model/pole.model";
import { PoleService } from "../../shared/service/pole/pole.service";
import { AlarmDialogComponent } from "../alarm-dialog/alarm-dialog.component";

@Component({
  selector: "ngx-data",
  templateUrl: "./data.component.html",
  styleUrls: ["./data.component.scss"],
})
export class DataComponent implements OnInit, OnDestroy {
  polesData: Array<PoleData>;
  polesData$: Subscription;

  alarmAmount: number;
  alarmList$: Subscription;

  // Connections
  poleConnection: number = 0;
  poleBroken: number = 0;
  lightAmount: number = 0;
  lightConnection: number = 0;
  lightBroken: number = 0;
  envAmount: number = 0;
  envConnection: number = 0;
  envBroken: number = 0;
  playerAmount: number = 0;
  playerConnection: number = 0;
  playerBroken: number = 0;
  solarAmount: number = 0;
  solarConnection: number = 0;
  solarBroken: number = 0;
  holderAmount: number = 0;
  holderConnection: number = 0;
  holderBroken: number = 0;
  // Connections

  // Enables
  lightEnable: number = 0;
  envEnable: number = 0;
  playerEnable: number = 0;
  solarEnable: number = 0;
  // Enables

  // chart options
  themeSubscription: any;
  poleOptions: any = {};
  lightOptions: any = {};
  weatherLineOptions: any;
  batteryOptions: any;

  // Line Data
  dataList = {};

  // weather
  weatherList = {
    t: $localize`:@@temperature:溫度` + "(°C)",
    rh: $localize`:@@humidity:濕度` + "(%)",
  };
  weatherKeys = Object.keys(this.weatherList);

  // air
  airList = {
    pm10: "PM10 (μg/m³)",
    "pm2.5": "PM2.5 (μg/m³)",
    co: $localize`:@@co:一氧化碳` + "(PPM)",
    o3: $localize`:@@o3:臭氧` + "(PPM)",
    no2: $localize`:@@no2:二氧化氮` + "(PPM)",
    so2: $localize`:@@so2:二氧化硫` + "(PPM)",
  };
  airKeys = Object.keys(this.airList);

  constructor(
    private theme: NbThemeService,
    private dialogService: NbDialogService,
    private poleService: PoleService,
    private alarmService: AlarmService,
    @Inject(LOCALE_ID) private locale: string
  ) { }

  ngOnInit(): void {
    this.alarmList$ = this.alarmService.alarmList$.subscribe(
      (res) => (this.alarmAmount = res.length)
    );
    this.getPolesData();
  }

  ngOnDestroy(): void {
    if (this.alarmList$) {
      this.alarmList$.unsubscribe();
    }
    if (this.themeSubscription) {
      this.themeSubscription.unsubscribe();
    }
    if (this.polesData$) {
      this.polesData$.unsubscribe();
    }
  }

  getPolesData(): void {
    this.polesData$ = this.poleService.polesData$.subscribe((data) => {
      this.polesData = data;
      this.resetAmount();
      this.polesData.forEach((poleData) => {
        this.checkConnection(poleData);
        this.checkEnable(poleData);
      });

      this.createLightDonut();
      this.getPoleLogs();
      this.createBarChart();
      this.createPoleDonut();
    });
  }

  getPoleLogs(): void {
    let poleData = this.polesData.find(
      (poleData) => poleData.environment_enable
    );
    let now = new Date();
    let request = new PoleLogRequest();
    request.scope = "hour";
    request.time_start =
      formatDate(now.getTime() - 86400000, "YYYY-MM-dd HH", this.locale) +
      ":00:00";
    request.time_end = formatDate(now, "YYYY-MM-dd HH", this.locale) + ":00:00";
    request.uuid = poleData
      ? poleData.uuid
      : "9e2e0fe3-878a-409f-8e12-d4d6794b1429";
    request.type = "environment";
    this.poleService
      .getPoleLogsData(request)
      .subscribe((logs) => this.saveLogData(logs));
  }

  formatDateForLogs(date: Date): string {
    return formatDate(date, "YYYY-MM-dd HH:mm", this.locale) + ":00";
  }

  saveLogData(logs: Array<PoleLog>): void {
    for (let key of Object.keys(this.airList)) {
      let log = logs[0]?.log?.find((logData) => logData?.record === key);
      if (log) {
        this.dataList[key] = log.array;
      }
    }
    for (let key of Object.keys(this.weatherList)) {
      let log = logs[0]?.log?.find((logData) => logData?.record === key);
      if (log) {
        this.dataList[key] = log.array;
      }
    }
  }

  resetAmount(): void {
    this.poleConnection = 0;
    this.poleBroken = 0;
    this.lightAmount = 0;
    this.lightConnection = 0;
    this.lightBroken = 0;
    this.envAmount = 0;
    this.envConnection = 0;
    this.envBroken = 0;
    this.playerAmount = 0;
    this.playerConnection = 0;
    this.playerBroken = 0;
    this.solarAmount = 0;
    this.solarConnection = 0;
    this.solarBroken = 0;
    this.holderAmount = 0;
    this.holderConnection = 0;
    this.holderBroken = 0;
    this.lightEnable = 0;
    this.envEnable = 0;
    this.playerEnable = 0;
    this.solarEnable = 0;
  }

  checkConnection(pole: PoleData): void {
    let isConnection = true;
    if (pole?.light_show) {
      ++this.lightAmount;
      if (
        !(
          pole.light_show === "offline" &&
          (this.alarmService.isLegalLightTime(pole.light_show_time) ||
            !this.alarmService.isLatestRecord(pole.light_show_time))
        )
      ) {
        ++this.lightConnection;
      } else {
        isConnection = false;
        ++this.lightBroken;
      }
    }
    if (pole?.environment_show) {
      ++this.envAmount;
      if (
        pole.environment_show === "online" &&
        pole.environment_connect === "on"
      ) {
        ++this.envConnection;
      } else {
        isConnection = false;
        ++this.envBroken;
      }
    }
    if (pole?.player_show) {
      ++this.playerAmount;
      if (pole.player_show === "online" && pole.player_connect === "on") {
        ++this.playerConnection;
      } else {
        isConnection = false;
        ++this.playerBroken;
      }
    }
    if (pole?.solar_show) {
      ++this.solarAmount;
      if (pole.solar_show === "online" && pole.solar_connect === "on") {
        ++this.solarConnection;
      } else {
        isConnection = false;
        ++this.solarBroken;
      }
    }
    if (pole?.holder_show) {
      ++this.holderAmount;
      if (pole.holder_show === "online" && pole.holder_connect === "on") {
        ++this.holderConnection;
      } else {
        isConnection = false;
        ++this.holderBroken;
      }
    }
    if (isConnection) {
      ++this.poleConnection;
    } else {
      ++this.poleBroken;
    }
  }

  getPoleList(): Array<Object> {
    let poleList: Array<Object> = [];
    this.polesData.forEach((poleData) =>
      poleList.push({ title: poleData.number, value: poleData.number })
    );
    return poleList;
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

  checkEnable(pole: PoleData): void {
    if (pole?.light_enable === true) {
      ++this.lightEnable;
    }
    if (pole?.environment_enable === true) {
      ++this.envEnable;
    }
    if (pole?.player_enable === true) {
      ++this.playerEnable;
    }
    if (pole?.solar_enable === true) {
      ++this.solarEnable;
    }
  }

  checkBatteryLevel(maxLevel: number, minLevel: number): number {
    let amount = 0;
    this.polesData.forEach((pole) => {
      if (pole?.bc) {
        if (pole.bc >= minLevel && pole.bc < maxLevel) {
          ++amount;
        }
      }
    });
    return amount;
  }

  createPoleDonut() {
    this.themeSubscription = this.theme.getJsTheme().subscribe((config) => {
      const colors = config.variables;
      const echarts: any = config.variables.echarts;

      this.poleOptions = {
        backgroundColor: echarts.bg,
        color: [colors.infoLight, colors.warningLight],
        tooltip: {
          trigger: "item",
          formatter: "{a} <br/>{b} : {c} ({d}%)",
        },
        legend: {
          show: false,
          orient: "vertical",
          left: "left",
          data: [
            $localize`:@@activateAmt:正常數量`,
            $localize`:@@failureAmt:異常數量`,
          ],
          textStyle: {
            color: echarts.textColor,
          },
        },
        series: [
          {
            name: $localize`:@@smartPole:智慧桿`,
            type: "pie",
            radius: "80%",
            center: ["50%", "50%"],
            data: [
              {
                value: this.poleConnection,
                name: $localize`:@@poleActivate:正常運作`,
              },
              {
                value: this.poleBroken,
                name: $localize`:@@poleFailure:異常數量`,
              },
            ],
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: echarts.itemHoverShadowColor,
              },
            },
            label: {
              show: false,
            },
            labelLine: {
              show: false,
            },
          },
        ],
      };
    });
  }

  createLightDonut(): void {
    this.themeSubscription = this.theme.getJsTheme().subscribe((config) => {
      const colors = config.variables;
      const echarts: any = config.variables.echarts;

      this.lightOptions = {
        backgroundColor: echarts.bg,
        color: [colors.infoLight, colors.warningLight],
        tooltip: {
          trigger: "item",
          formatter: "{a} <br/>{b} : {c} ({d}%)",
        },
        legend: {
          show: false,
          orient: "vertical",
          left: "left",
          data: [
            $localize`:@@activateAmt:正常數量`,
            $localize`:@@failureAmt:異常數量`,
          ],
          textStyle: {
            color: echarts.textColor,
          },
        },
        series: [
          {
            name: $localize`:@@smartLight:智慧照明`,
            type: "pie",
            radius: "80%",
            center: ["50%", "50%"],
            data: [
              {
                value: this.lightConnection,
                name: $localize`:@@poleActivate:正常運作`,
              },
              {
                value: this.lightBroken,
                name: $localize`:@@poleFailure:異常數量`,
              },
            ],
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: echarts.itemHoverShadowColor,
              },
            },
            label: {
              show: false,
            },
            labelLine: {
              show: false,
            },
          },
        ],
      };
    });
  }

  createBarChart(): void {
    this.themeSubscription = this.theme.getJsTheme().subscribe((config) => {
      const colors: any = config.variables;
      const echarts: any = config.variables.echarts;

      this.batteryOptions = {
        backgroundColor: echarts.bg,
        color: [colors.primaryLight],
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "shadow",
          },
        },
        grid: {
          top: "30px",
          left: "2px",
          right: "50px",
          bottom: "2px",
          containLabel: true,
        },
        xAxis: [
          {
            name: $localize`:@@amount:數量`,
            type: "value",
            max: this.polesData.length,
            min: 0,
            splitNumber: this.polesData.length,
            axisLine: {
              lineStyle: {
                color: echarts.axisLineColor,
              },
            },
            splitLine: {
              lineStyle: {
                color: echarts.splitLineColor,
              },
            },
            axisLabel: {
              color: echarts.textColor,
            },
          },
        ],
        yAxis: [
          {
            name: $localize`:@@bc:電量`,
            type: "category",
            data: ["< 51%", "51% - 75%", "> 75%"],
            scale: true,
            axisTick: {
              alignWithLabel: true,
            },
            axisLine: {
              lineStyle: {
                color: echarts.axisLineColor,
              },
            },
            axisLabel: {
              color: echarts.textColor,
            },
          },
        ],
        series: [
          {
            name: $localize`:@@amount:數量`,
            type: "bar",
            center: ["50%", "25%"],
            barWidth: "60%",
            data: [
              this.checkBatteryLevel(51, 0),
              this.checkBatteryLevel(76, 51),
              this.checkBatteryLevel(101, 76),
            ],
          },
        ],
      };
    });
  }
}
