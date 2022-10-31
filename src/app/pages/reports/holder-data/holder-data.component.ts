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
  selector: "holder-data",
  templateUrl: "./holder-data.component.html",
  styleUrls: ["./holder-data.component.scss"],
})
export class HolderDataComponent implements OnInit {
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
    ht: $localize`:@@htWithUnit:箱內溫度 (°C)`,
    hh: $localize`:@@hhWithUnit:箱內濕度 (%)`,
  };

  // 智慧桿歷程資料
  poleLogsData: PoleLog;
  mergedData: object[];
  // 智慧桿歷程資料

  // Charts
  temperatureLineOptions: any;
  humidityLineOptions: any;
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
        poleLogsData.log.find((logData) => logData.record === "ht").array,
        colors,
        echarts
      );
      this.setHumidityLine(
        poleLogsData.log.find((logData) => logData.record === "hh").array,
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
        data: [$localize`:@@ht:箱內溫度`],
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
          name: $localize`:@@ht:箱內溫度`,
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
        data: [$localize`:@@hh:箱內濕度`],
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
          name: $localize`:@@hh:箱內濕度`,
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

  exportCSV(): void {
    this.clickExportCSV.emit([
      this.poleData.number,
      this.dateScope,
      this.mergedData,
    ]);
  }
}
