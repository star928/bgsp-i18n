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
import { LocalDataSource } from "ng2-smart-table";
import { TYPE_FILTER } from "../../../shared/const/alarm-range";
import { PoleData, PoleLog } from "../../../shared/model/pole.model";
import { AlarmService } from "./../../../shared/service/alarm/alarm.service";

@Component({
  selector: "ngx-alarm-log",
  templateUrl: "./alarm-log.component.html",
  styleUrls: ["./alarm-log.component.scss"],
})
export class AlarmLogComponent implements OnInit {
  @Input() polesData: Array<PoleData>;
  @Output() clickExportPDF = new EventEmitter<Array<Object>>();
  poleData: PoleData;
  alarmLogs: Array<Object>;
  settings: Object;

  source: LocalDataSource = new LocalDataSource();

  constructor(
    private alarmService: AlarmService,
    @Inject(LOCALE_ID) private locale: string
  ) { }

  ngOnInit(): void {
    this.poleData = this.polesData[0];
    this.tableSetting();
  }

  tableSetting(): void {
    this.settings = {
      mode: "external",
      hideHeader: true,
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
        type: {
          title: $localize`:@@featureType:功能名稱`,
          type: "string",
          filter: {
            type: "list",
            config: {
              selectText: $localize`:@@showAllFeature:顯示所有功能`,
              list: TYPE_FILTER,
            },
          },
        },
        status: {
          title: $localize`:@@status:狀態`,
          type: "string",
          filter: true,
        },
      },
      pager: {
        display: true,
        perPage: 10,
        filter: true,
      },
    };
  }

  getPoleLogs(pole: PoleData, startDate: any, endDate: any): void {
    if (startDate.queue < endDate.queue) {
      let time_start = formatDate(
        new Date(startDate.queue),
        "YYYY-MM-dd HH:mm:ss",
        this.locale
      );
      let time_end = formatDate(
        new Date(new Date(endDate.queue).getTime() + 1000),
        "YYYY-MM-dd HH:mm:ss",
        this.locale
      );
      this.alarmService
        .getAlarmData(pole, time_start, time_end)
        .subscribe((data) => {
          this.alarmLogs = data;
          if (this.alarmLogs && this.alarmLogs.length > 0) {
            this.source.load(this.alarmLogs);
          } else {
            alert($localize`:@@noQueriesFound:查無資料`);
            this.source.load([]);
          }
        });
    } else {
      alert($localize`:@@selectedDateError:時間選取有誤，請重新選擇！`);
    }
  }

  exportPDF(): void {
    this.clickExportPDF.emit(this.alarmLogs);
  }
}
