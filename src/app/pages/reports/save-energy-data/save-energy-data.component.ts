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
import { PoleData, PoleLog } from "../../../shared/model/pole.model";
import { PoleService } from "../../../shared/service/pole/pole.service";
import { DataUtilsService } from "./../../../shared/service/utils/data-utils.service";

@Component({
  selector: "save-energy-data",
  templateUrl: "./save-energy-data.component.html",
  styleUrls: ["./save-energy-data.component.scss"],
})
export class SaveEnergyDataComponent implements OnInit {
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
    ai: $localize`:@@inputCurrentWithUnit:充電電流 (mA)`,
    vi: $localize`:@@inputVoltWithUnit:充電電壓 (V)`,
    pi: $localize`:@@inputPowerWithUnit:充電功率 (W)`,
    ei: $localize`:@@inputEnergyWithUnit:充電功耗 (Wh)`,
    ao: $localize`:@@outputCurrentWithUnit:放電電流 (mA)`,
    vo: $localize`:@@outputVoltWithUnit:放電電壓 (V)`,
    po: $localize`:@@outputPowerWithUnit:放電功率 (W)`,
    eo: $localize`:@@outputEnergyWithUnit:放電功耗 (Wh)`,
    bc: $localize`:@@bcPowerWithUnit:電量 (%)`,
    bt: $localize`:@@btWithUnit:電池溫度 (°C)`,
  };

  // 智慧桿歷程資料
  poleLogsData: PoleLog;
  mergedData: object[];
  // 智慧桿歷程資料

  // Charts
  batteryLineOptions: any;
  temperatureLineOptions: any;
  voltLineOptions: any;
  ampLineOptions: any;
  powerLineOptions: any;
  energyLineOptions: any;
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
    this.batteryLineOptions = null;
    this.temperatureLineOptions = null;
    this.voltLineOptions = null;
    this.ampLineOptions = null;
    this.powerLineOptions = null;
    this.energyLineOptions = null;
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
      this.setBatteryLine(
        poleLogsData.log.find((logData) => logData.record === "bc").array,
        colors,
        echarts
      );
      this.setTemperatureLine(
        poleLogsData.log.find((logData) => logData.record === "bt").array,
        colors,
        echarts
      );
      this.setAmpLine(
        poleLogsData.log.find((logData) => logData.record === "ai").array,
        poleLogsData.log.find((logData) => logData.record === "ao").array,
        colors,
        echarts
      );
      this.setVoltLine(
        poleLogsData.log.find((logData) => logData.record === "vi").array,
        poleLogsData.log.find((logData) => logData.record === "vo").array,
        colors,
        echarts
      );
      this.setPowerLine(
        poleLogsData.log.find((logData) => logData.record === "pi").array,
        poleLogsData.log.find((logData) => logData.record === "po").array,
        colors,
        echarts
      );
      this.setEnergyLine(
        poleLogsData.log.find((logData) => logData.record === "ei").array,
        poleLogsData.log.find((logData) => logData.record === "eo").array,
        colors,
        echarts
      );
    });
  }

  setBatteryLine(
    recordLogData: Array<Array<string>>,
    colors: any,
    echarts: any
  ): void {
    this.batteryLineOptions = {
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
        data: [$localize`:@@bc:電量`],
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
          name: $localize`:@@bcUnit:單位 : %`,
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
          name: $localize`:@@bc:電量`,
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
        data: [$localize`:@@batteryTemperature:電池溫度`],
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
          name: $localize`:@@batteryTemperature:電池溫度`,
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
    ai: Array<Array<string>>,
    ao: Array<Array<string>>,
    colors: any,
    echarts: any
  ): void {
    this.ampLineOptions = {
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
          $localize`:@@inputCurrent:充電電流`,
          $localize`:@@outputCurrent:放電電流`,
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
          name: $localize`:@@inputCurrent:充電電流`,
          type: "line",
          smooth: true,
          data: ai,
        },
        {
          name: $localize`:@@outputCurrent:放電電流`,
          type: "line",
          smooth: true,
          data: ao,
        },
      ],
    };
  }

  setVoltLine(
    vi: Array<Array<string>>,
    vo: Array<Array<string>>,
    colors: any,
    echarts: any
  ): void {
    this.voltLineOptions = {
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
          $localize`:@@inputVoltage:充電電壓`,
          $localize`:@@outputVoltage:放電電壓`,
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
          name: $localize`:@@inputVoltage:充電電壓`,
          type: "line",
          smooth: true,
          data: vi,
        },
        {
          name: $localize`:@@outputVoltage:放電電壓`,
          type: "line",
          smooth: true,
          data: vo,
        },
      ],
    };
  }

  setPowerLine(
    pi: Array<Array<string>>,
    po: Array<Array<string>>,
    colors: any,
    echarts: any
  ): void {
    this.powerLineOptions = {
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
          $localize`:@@inputPower:充電功率`,
          $localize`:@@outputPower:放電功率`,
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
          name: $localize`:@@inputPower:充電功率`,
          type: "line",
          smooth: true,
          data: pi,
        },
        {
          name: $localize`:@@outputPower:放電功率`,
          type: "line",
          smooth: true,
          data: po,
        },
      ],
    };
  }

  setEnergyLine(
    ei: Array<Array<string>>,
    eo: Array<Array<string>>,
    colors: any,
    echarts: any
  ): void {
    this.energyLineOptions = {
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
          $localize`:@@inputEnergy:充電功耗`,
          $localize`:@@outputEnergy:放電功耗`,
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
          name: $localize`:@@inputEnergy:充電功耗`,
          type: "line",
          smooth: true,
          data: ei,
        },
        {
          name: $localize`:@@outputEnergy:放電功耗`,
          type: "line",
          smooth: true,
          data: eo,
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
