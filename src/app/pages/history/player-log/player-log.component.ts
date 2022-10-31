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
import { PoleData, PoleLog } from "../../../shared/model/pole.model";
import { PoleService } from "../../../shared/service/pole/pole.service";

@Component({
  selector: "ngx-player-log",
  templateUrl: "./player-log.component.html",
  styleUrls: ["./player-log.component.scss"],
})
export class PlayerLogComponent implements OnInit {
  @Input() type: Array<string>;
  @Input() polesData: Array<PoleData>;
  @Output() clickExportPDF = new EventEmitter<Array<PoleLog>>();
  poleData: PoleData;
  poleLogs: Array<PoleLog>;

  settings = {
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
      0: {
        title: $localize`:@@recordDate:紀錄日期`,
        type: "string",
        filter: true,
      },
      1: {
        title: $localize`:@@mediaRecord:播放內容`,
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

  source: LocalDataSource = new LocalDataSource();

  constructor(
    private poleService: PoleService,
    @Inject(LOCALE_ID) private locale: string
  ) { }

  ngOnInit(): void {
    this.poleData = this.polesData[0];
  }

  getPoleLogs(poleId: string, startDate: any, endDate: any): void {
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
      this.poleService
        .getPoleLogs(poleId, this.type[0], this.type[1], time_start, time_end)
        .subscribe((data) => {
          this.poleLogs = data;
          if (this.poleLogs && this.poleLogs[0].log.length > 0) {
            this.source.load(this.poleLogs[0].log[0].array.reverse());
          } else {
            alert($localize`:@@noQueriesFound:查無資料`);
            this.poleLogs = [];
            this.source.load(this.poleLogs);
          }
        });
    } else {
      alert($localize`:@@selectedDateError:時間選取有誤，請重新選擇！`);
    }
  }

  exportPDF(): void {
    this.clickExportPDF.emit(this.poleLogs);
  }
}
