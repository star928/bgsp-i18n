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
  selector: "ngx-save-energy",
  templateUrl: "./save-energy.component.html",
  styleUrls: ["./save-energy.component.scss"],
})
export class SaveEnergyComponent implements OnChanges, OnInit {
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
      ai: {
        title: $localize`:@@inputCurrentWithUnit:充電電流 (mA)`,
        type: "number",
        filter: true,
      },
      vi: {
        title: $localize`:@@inputVoltWithUnit:充電電壓 (V)`,
        type: "number",
        filter: true,
      },
      pi: {
        title: $localize`:@@inputPowerWithUnit:充電功率 (W)`,
        type: "number",
        filter: true,
      },
      ao: {
        title: $localize`:@@outputCurrentWithUnit:放電電流 (mA)`,
        type: "number",
        filter: true,
      },
      vo: {
        title: $localize`:@@outputVoltWithUnit:放電電壓 (V)`,
        type: "number",
        filter: true,
      },
      po: {
        title: $localize`:@@outputPowerWithUnit:放電功率 (W)`,
        type: "number",
        filter: true,
      },
      bt: {
        title: $localize`:@@btWithUnit:電池溫度 (°C)`,
        type: "number",
        filter: true,
      },
      bc: {
        title: $localize`:@@bcPowerWithUnit:電量 (%)`,
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
