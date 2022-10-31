import { Component, Input, OnInit, SimpleChanges } from "@angular/core";
import { LocalDataSource } from "ng2-smart-table";
import { PoleData } from "../../../shared/model/pole.model";

@Component({
  selector: "ngx-holder",
  templateUrl: "./holder.component.html",
  styleUrls: ["./holder.component.scss"],
})
export class HolderComponent implements OnInit {
  constructor() { }

  @Input() polesData: Array<PoleData>;

  settings = {
    mode: "external",
    hideHeader: true,
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
      number: {
        title: $localize`:@@smartPoleNumber:智慧桿編號`,
        type: "string",
        filter: true,
      },
      holder_show: {
        title: $localize`:@@connectStatus:連線狀態`,
        type: "string",
        filter: true,
      },
      hd: {
        title: $localize`:@@hd:箱門狀態`,
        type: "string",
        filter: true,
      },
      ht: {
        title: $localize`:@@htWithUnit:箱內溫度 (°C)`,
        type: "number",
        filter: true,
      },
      hh: {
        title: $localize`:@@hhWithUnit:箱內濕度 (%)`,
        type: "number",
        filter: true,
      },
    },
    pager: {
      display: true,
      perPage: 5,
      filter: false,
    },
  };
  source: LocalDataSource = new LocalDataSource();

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["polesData"]) {
      this.source.load(this.polesData);
    }
  }

  ngOnInit(): void {
    this.source.load(this.polesData);
  }
}
