import { SETTINGS } from "./../../../shared/const/system-config";
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
import { PoleLogRequest } from "../../../shared/model/pole-log-request.model";
import { LogData, PoleData, PoleLog } from "../../../shared/model/pole.model";
import { PoleService } from "../../../shared/service/pole/pole.service";
import { DataUtilsService } from "../../../shared/service/utils/data-utils.service";

@Component({
  selector: "smart-light-data",
  templateUrl: "./smart-light-data.component.html",
  styleUrls: ["./smart-light-data.component.scss"],
})
export class SmartLightDataComponent implements OnInit {
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
    b: $localize`:@@brightnessWithUnit:亮度 (%)`,
    v: $localize`:@@voltWithUnit:電壓 (V)`,
    c: $localize`:@@currentWithUnit:電流 (mA)`,
    p: $localize`:@@powerWithUnit:功率 (W)`,
    e: $localize`:@@energyWithUnit:功耗 (Wh)`,
  };

  // 智慧桿歷程資料
  poleLogsData: PoleLog;
  mergedData: object[];
  // 智慧桿歷程資料

  // Charts
  brightLineOptions: any;
  voltLineOptions: any;
  ampLineOptions: any;
  powerLineOptions: any;
  energyLineOptions: any;
  multiLineOptions: any;

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
        if (data[0]?.log?.length > 0) {
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
          alert($localize`:@@noQueriesFound:查無資料`);
        }
      });
    } else {
      alert($localize`:@@selectedDateError:時間選取有誤，請重新選擇！`);
    }
  }

  resetCharts(): void {
    this.brightLineOptions = null;
    this.voltLineOptions = null;
    this.ampLineOptions = null;
    this.powerLineOptions = null;
    this.multiLineOptions = null;
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
      this.setBrightLine(
        poleLogsData.log.find((logData) => logData.record === "b").array,
        colors,
        echarts
      );
      this.setVoltLine(
        poleLogsData.log.find((logData) => logData.record === "v").array,
        colors,
        echarts
      );
      this.setAmpLine(
        poleLogsData.log.find((logData) => logData.record === "c").array,
        colors,
        echarts
      );
      this.setPowerLine(
        poleLogsData.log.find((logData) => logData.record === "p").array,
        colors,
        echarts
      );
      this.setEnergyLine(
        poleLogsData.log.find((logData) => logData.record === "e").array,
        colors,
        echarts
      );
    });
  }

  setBrightLine(
    recordLogData: Array<Array<string>>,
    colors: any,
    echarts: any
  ): void {
    this.brightLineOptions = {
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
        data: [$localize`:@@brightness:亮度`],
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
          name: $localize`:@@brightnessUnit:單位 : %`,
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
          name: $localize`:@@brightness:亮度`,
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

  setVoltLine(
    recordLogData: Array<Array<string>>,
    colors: any,
    echarts: any
  ): void {
    this.voltLineOptions = {
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
        data: [$localize`:@@voltage:電壓`],
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
          name: $localize`:@@voltUnit:單位 : V`,
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
          name: $localize`:@@voltage:電壓`,
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

  setAmpLine(
    recordLogData: Array<Array<string>>,
    colors: any,
    echarts: any
  ): void {
    this.ampLineOptions = {
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
        data: [$localize`:@@current:電流`],
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
          name: $localize`:@@currentUnit:單位 : mA`,
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
          name: $localize`:@@current:電流`,
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

  setPowerLine(
    recordLogData: Array<Array<string>>,
    colors: any,
    echarts: any
  ): void {
    this.powerLineOptions = {
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
        data: [$localize`:@@power:功率`],
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
          name: $localize`:@@powerUnit:單位 : W`,
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
          name: $localize`:@@power:功率`,
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
  setEnergyLine(
    recordLogData: Array<Array<string>>,
    colors: any,
    echarts: any
  ): void {
    this.energyLineOptions = {
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
        data: [$localize`:@@energy:功耗`],
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
          name: $localize`:@@energyUnit:單位 : Wh`,
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
          name: $localize`:@@energy:功耗`,
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
