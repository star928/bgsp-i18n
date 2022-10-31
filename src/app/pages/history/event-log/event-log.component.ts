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
import { PoleLogRequest } from "../../../shared/model/pole-log-request.model";
import { PoleData, PoleLog } from "../../../shared/model/pole.model";
import { PoleService } from "../../../shared/service/pole/pole.service";

@Component({
  selector: "ngx-event-log",
  templateUrl: "./event-log.component.html",
  styleUrls: ["./event-log.component.scss"],
})
export class EventLogComponent implements OnInit {
  @Input() polesData: Array<PoleData>;
  @Output() clickExportPDF = new EventEmitter<Array<any>>();
  poleData: PoleData;
  types: Object = {
    light: $localize`:@@smartLight:智慧照明`,
    environment: $localize`:@@environment:環境感測`,
    player: $localize`:@@digitalSignage:數位看板`,
    solar: $localize`:@@solar:儲能系統`,
    holder: $localize`:@@holder:箱體狀態`,
  };
  records: Object = {
    show: $localize`:@@connectStatus:連線狀態`,
    connect: $localize`:@@wireStatus:線路狀態`,
    hd: $localize`:@@hd:箱門狀態`,
  };
  deviceTypes: Array<string> = Object.keys(this.types);
  deviceType: string = "light";
  recordTypes: Object = {
    light: ["show"],
    environment: ["show", "connect"],
    player: ["show", "connect"],
    solar: ["show", "connect"],
    holder: ["show", "connect", "hd"],
  };
  recordType: string = "show";
  poleLogs: Array<Array<string>>;
  startDate: any;

  settings = {
    mode: "external",
    hideSubHeader: false,
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
        title: $localize`:@@eventDate:事件日期`,
        type: "string",
        filter: true,
      },
      1: {
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
      let request = new PoleLogRequest();
      request.uuid = poleId;
      request.type = this.deviceType;
      request.record = this.recordType;
      request.time_start = time_start;
      request.time_end = time_end;
      this.poleService.getPoleLogsData(request).subscribe((data) => {
        if (data && data[0]?.log[0]?.array.length > 0) {
          this.source.load(this.dataTranslate(data));
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

  dataTranslate(poleLogs: Array<PoleLog>): Array<Array<string>> {
    this.poleLogs = [];
    poleLogs[0].log[0].array.forEach((log) =>
      this.poleLogs.push([log[0], log[1]])
    );
    return this.poleLogs;
  }

  exportPDF(): void {
    this.clickExportPDF.emit([
      this.poleLogs,
      this.types[this.deviceType],
      this.records[this.recordType],
    ]);
  }
}
