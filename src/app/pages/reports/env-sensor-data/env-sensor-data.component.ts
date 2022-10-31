import { formatDate } from "@angular/common";
import {
  Component,
  EventEmitter,
  Inject,
  Input,
  LOCALE_ID,
  OnInit,
  Output,
} from "@angular/core";
import { NbThemeService } from "@nebular/theme";
import { Subscription } from "rxjs";
import { SETTINGS } from "../../../shared/const/system-config";
import { PoleLogRequest } from "../../../shared/model/pole-log-request.model";
import { LogData, PoleData, PoleLog } from "../../../shared/model/pole.model";
import { PoleService } from "../../../shared/service/pole/pole.service";
import { DataUtilsService } from "../../../shared/service/utils/data-utils.service";

@Component({
  selector: "env-sensor-data",
  templateUrl: "./env-sensor-data.component.html",
  styleUrls: ["./env-sensor-data.component.scss"],
})
export class EnvSensorDataComponent implements OnInit {
  @Input() polesData: Array<PoleData>;
  @Input() deviceType: string;
  @Output() clickExportCSV = new EventEmitter<Array<any>>();

  themeSubscription: Subscription;
  poleData: PoleData;
  scopeTypes: Array<string> = [
    $localize`:@@month:月`,
    $localize`:@@week:週`,
    $localize`:@@day:日`,
    $localize`:@@hour:小時`,
  ];
  dateScopes = {};
  dateScope = $localize`:@@day:日`;
  scopesTime = {}; // 毫秒
  recordName = {
    t: $localize`:@@tempWithUnit:溫度 (°C)`,
    rh: $localize`:@@humWithUnit:濕度 (%)`,
    pm10: "PM10 (μg/m³)",
    "pm2.5": "PM2.5 (μg/m³)",
    co: $localize`:@@coWithUnit:一氧化碳 (PPM)`,
    o3: $localize`:@@o3WithUnit:臭氧 (PPM)`,
    no2: $localize`:@@no2WithUnit:二氧化氮 (PPM)`,
    so2: $localize`:@@so2WithUnit:二氧化硫 (PPM)`,
  };

  // 智慧桿歷程資料
  poleLogsData: PoleLog;
  mergedData: object[];
  // 智慧桿歷程資料

  // Charts
  temperatureLineOptions: any;
  humidityLineOptions: any;
  particulatesLineOptions: any;
  airQualityLineOptions: any;
  multiLineInstance: any;
  // Charts

  constructor(
    private theme: NbThemeService,
    private poleService: PoleService,
    private dataUtilsService: DataUtilsService,
    @Inject(LOCALE_ID) private locale: string
  ) {
    this.dateScopes[$localize`:@@month:月`] = "month";
    this.dateScopes[$localize`:@@week:週`] = "week";
    this.dateScopes[$localize`:@@day:日`] = "day";
    this.dateScopes[$localize`:@@hour:小時`] = "hour";
    this.scopesTime[$localize`:@@week:週`] = 604800000;
    this.scopesTime[$localize`:@@day:日`] = 86400000;
    this.scopesTime[$localize`:@@hour:小時`] = 3600000;
  }

  ngOnInit(): void {
    this.poleData = this.polesData[0];
  }

  ngOnDestroy(): void {
    if (this.themeSubscription) {
      this.themeSubscription.unsubscribe();
    }
  }

  // 智慧桿歷程資料
  getPoleLogData(poleData: PoleData, startDate: any, endDate: any): void {
    if (startDate.queue < endDate.queue) {
      let uuid = poleData.uuid;
      let scope = this.dateScopes[this.dateScope];
      let startTime = formatDate(
        new Date(startDate.queue),
        "yyyy-MM-dd HH:mm:ss",
        this.locale
      );
      let endTime = formatDate(
        new Date(new Date(endDate.queue).getTime() + 1000),
        "yyyy-MM-dd HH:mm:ss",
        this.locale
      );
      let type = this.deviceType;
      let request = new PoleLogRequest();
      request.uuid = uuid;
      request.type = type;
      request.scope = scope;
      request.time_start = startTime;
      request.time_end = endTime;
      this.poleService.getPoleLogsData(request).subscribe((data) => {
        if (data[0].log.length > 0) {
          this.poleLogsData = this.dataUtilsService.fillData(
            data[0],
            startTime,
            endTime,
            this.dateScope
          );
          this.createChart(this.poleLogsData);
          this.mergedData = this.dataUtilsService.mergeLogData(
            this.poleLogsData,
            this.recordName
          );
        } else {
          this.resetCharts();
          alert($localize`:@@noQueriesFound:查無資料`);
        }
      });
    } else {
      alert($localize`:@@selectedDateError:時間選取有誤，請重新選擇！`);
    }
  }

  resetCharts(): void {
    this.temperatureLineOptions = null;
    this.humidityLineOptions = null;
    this.particulatesLineOptions = null;
    this.airQualityLineOptions = null;
    this.multiLineInstance = null;
  }

  // 智慧桿歷程資料

  addDate(date: number): number {
    if (this.dateScope === $localize`:@@month:月`) {
      return new Date(date).setMonth(new Date(date).getMonth() + 1);
    } else {
      return new Date(date).getTime() + this.scopesTime[this.dateScope];
    }
  }

  createChart(poleLogsData: PoleLog): void {
    this.themeSubscription = this.theme.getJsTheme().subscribe((config) => {
      const colors: any = config.variables;
      const echarts: any = config.variables.echarts;
      this.setTemperatureLine(
        poleLogsData.log.find((logData) => logData.record === "t").array,
        colors,
        echarts
      );
      this.setHumidityLine(
        poleLogsData.log.find((logData) => logData.record === "rh").array,
        colors,
        echarts
      );
      this.setParticulatesLine(
        poleLogsData.log.find((logData) => logData.record === "pm10").array,
        poleLogsData.log.find((logData) => logData.record === "pm2.5").array,
        colors,
        echarts
      );
      this.setAirQualityLine(
        poleLogsData.log.find((logData) => logData.record === "co").array,
        poleLogsData.log.find((logData) => logData.record === "o3").array,
        poleLogsData.log.find((logData) => logData.record === "no2").array,
        poleLogsData.log.find((logData) => logData.record === "so2").array,
        colors,
        echarts
      );
    });
  }

  setTemperatureLine(
    recordLogData: Array<Array<string>>,
    colors: any,
    echarts: any
  ): void {
    this.temperatureLineOptions = {
      backgroundColor: echarts.bg,
      color: [colors.infoLight],
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "cross",
          label: {
            backgroundColor: echarts.tooltipBackgroundColor,
          },
        },
      },
      legend: {
        data: [$localize`:@@temperature:溫度`],
        textStyle: {
          color: echarts.textColor,
        },
      },
      grid: {
        bottom: "3%",
        left: "4%",
        right: "4%",
        containLabel: true,
      },
      xAxis: [
        {
          type: "time",
          boundaryGap: false,
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
      yAxis: [
        {
          name: $localize`:@@tempUnit:單位 : °C`,
          type: "value",
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
      series: [
        {
          name: $localize`:@@temperature:溫度`,
          type: "line",
          smooth: true,
          label: {
            show: false,
          },
          areaStyle: { opacity: echarts.areaOpacity },
          data: recordLogData,
        },
      ],
    };
  }

  setHumidityLine(
    recordLogData: Array<Array<string>>,
    colors: any,
    echarts: any
  ): void {
    this.humidityLineOptions = {
      backgroundColor: echarts.bg,
      color: [colors.infoLight],
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "cross",
          label: {
            backgroundColor: echarts.tooltipBackgroundColor,
          },
        },
      },
      legend: {
        data: [$localize`:@@humidity:濕度`],
        textStyle: {
          color: echarts.textColor,
        },
      },
      grid: {
        bottom: "3%",
        left: "4%",
        right: "4%",
        containLabel: true,
      },
      xAxis: [
        {
          type: "time",
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
      yAxis: [
        {
          name: $localize`:@@humUnit:單位 : %`,
          type: "value",
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
      series: [
        {
          name: $localize`:@@humidity:濕度`,
          type: "line",
          smooth: true,
          label: {
            show: false,
          },
          areaStyle: { opacity: echarts.areaOpacity },
          data: recordLogData,
        },
      ],
    };
  }

  setParticulatesLine(
    pm2_5: Array<Array<string>>,
    pm10: Array<Array<string>>,
    colors: any,
    echarts: any
  ): void {
    this.particulatesLineOptions = {
      backgroundColor: echarts.bg,
      color: [
        colors.infoLight,
        colors.dangerLight,
        colors.successLight,
        colors.primaryLight,
      ],
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "cross",
          label: {
            backgroundColor: echarts.tooltipBackgroundColor,
          },
        },
      },
      legend: {
        data: ["PM2.5", "PM10"],
        textStyle: {
          color: echarts.textColor,
        },
      },
      grid: {
        left: "3%",
        right: "4%",
        bottom: "3%",
        containLabel: true,
      },
      xAxis: [
        {
          type: "time",
          boundaryGap: false,
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
      yAxis: [
        {
          name: $localize`:@@PMUnit:單位 : μg/m³`,
          type: "value",
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
      series: [
        {
          name: "PM2.5",
          type: "line",
          smooth: true,
          data: pm2_5,
        },
        {
          name: "PM10",
          type: "line",
          smooth: true,
          data: pm10,
        },
      ],
    };
  }

  setAirQualityLine(
    o3: Array<Array<string>>,
    co: Array<Array<string>>,
    so2: Array<Array<string>>,
    no2: Array<Array<string>>,
    colors: any,
    echarts: any
  ): void {
    this.airQualityLineOptions = {
      backgroundColor: echarts.bg,
      color: [
        colors.infoLight,
        colors.dangerLight,
        colors.successLight,
        colors.primaryLight,
      ],
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "cross",
          label: {
            backgroundColor: echarts.tooltipBackgroundColor,
          },
        },
      },
      legend: {
        data: [
          $localize`:@@o3:臭氧`,
          $localize`:@@co:一氧化碳`,
          $localize`:@@no2:二氧化氮`,
          $localize`:@@so2:二氧化硫`,
        ],
        textStyle: {
          color: echarts.textColor,
        },
      },
      grid: {
        left: "3%",
        right: "4%",
        bottom: "3%",
        containLabel: true,
      },
      xAxis: [
        {
          type: "time",
          boundaryGap: false,
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
      yAxis: [
        {
          name: $localize`:@@AQUnit:單位 : PPM`,
          type: "value",
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
      series: [
        {
          name: $localize`:@@o3:臭氧`,
          type: "line",
          smooth: true,
          data: o3,
        },
        {
          name: $localize`:@@co:一氧化碳`,
          type: "line",
          smooth: true,
          data: co,
        },
        {
          name: $localize`:@@no2:二氧化氮`,
          type: "line",
          smooth: true,
          data: no2,
        },
        {
          name: $localize`:@@so2:二氧化硫`,
          type: "line",
          smooth: true,
          data: so2,
        },
      ],
    };
  }

  exportCSV(): void {
    this.clickExportCSV.emit([
      this.poleData.number,
      this.dateScope,
      this.mergedData,
    ]);
  }
}
