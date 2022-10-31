import { Component, Input, OnInit } from "@angular/core";
import { NbDialogRef } from "@nebular/theme";
import { LocalDataSource } from "ng2-smart-table";
import { Subscription } from "rxjs";
import { TYPE_FILTER } from "../../shared/const/alarm-range";
import { AlarmService } from "./../../shared/service/alarm/alarm.service";

@Component({
  selector: "ngx-alarm-dialog",
  templateUrl: "./alarm-dialog.component.html",
  styleUrls: ["./alarm-dialog.component.scss"],
})
export class AlarmDialogComponent implements OnInit {
  @Input() poleList: Array<Object>;
  alarmList$: Subscription;
  settings: Object;
  source: LocalDataSource = new LocalDataSource();

  constructor(
    protected ref: NbDialogRef<AlarmDialogComponent>,
    private alarmService: AlarmService
  ) {}

  ngOnInit(): void {
    this.getAlarmList();
    this.tableSetting();
  }

  getAlarmList(): void {
    this.alarmList$ = this.alarmService.alarmList$.subscribe((alarmList) =>
      this.source.load(alarmList)
    );
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
        id: {
          title: $localize`:@@smartPoleNumber:智慧桿編號`,
          type: "string",
          filter: {
            type: "list",
            config: {
              selectText: $localize`:@@showAllNumber:顯示所有編號`,
              list: this.poleList,
            },
          },
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

  close(): void {
    this.alarmList$.unsubscribe();
    this.ref.close();
  }
}
