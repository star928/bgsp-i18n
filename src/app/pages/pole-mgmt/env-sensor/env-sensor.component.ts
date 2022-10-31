import { PoleData } from "../../../shared/model/pole.model";
import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from "@angular/core";
import { LocalDataSource } from "ng2-smart-table";

@Component({
  selector: "ngx-env-sensor",
  templateUrl: "./env-sensor.component.html",
  styleUrls: ["./env-sensor.component.scss"],
})
export class EnvSensorComponent implements OnChanges, OnInit {
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
      t: {
        title: $localize`:@@tempWithUnit:溫度 (°C)`,
        type: "number",
        filter: true,
      },
      rh: {
        title: $localize`:@@humWithUnit:濕度 (%)`,
        type: "number",
        filter: true,
      },
      "pm2.5": {
        title: "PM2.5 (μg/m³)",
        type: "number",
        filter: true,
      },
      pm10: {
        title: "PM10 (μg/m³)",
        type: "number",
        filter: true,
      },
      co: {
        title: $localize`:@@coWithUnit:一氧化碳 (PPM)`,
        type: "number",
        filter: true,
      },
      o3: {
        title: $localize`:@@o3WithUnit:臭氧 (PPM)`,
        type: "number",
        filter: true,
      },
      no2: {
        title: $localize`:@@no2WithUnit:二氧化氮 (PPM)`,
        type: "number",
        filter: true,
      },
      so2: {
        title: $localize`:@@so2WithUnit:二氧化硫 (PPM)`,
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
