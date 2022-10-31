import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from "@angular/core";
import { NbDialogService } from "@nebular/theme";
import { LocalDataSource } from "ng2-smart-table";
import { PoleData } from "../../../shared/model/pole.model";
import { LightSettingsComponent } from "./light-settings/light-settings.component";
import { cloneDeep } from "lodash";
import { AuthService } from "../../../shared/service/auth/auth.service";
import { AlarmService } from "../../../shared/service/alarm/alarm.service";
import { SETTINGS } from "../../../shared/const/system-config";

@Component({
  selector: "ngx-smart-light",
  templateUrl: "./smart-light.component.html",
  styleUrls: ["./smart-light.component.scss"],
})
export class SmartLightComponent implements OnInit, OnChanges {
  @Input() polesData: Array<PoleData>;
  @Output() onUpdated: EventEmitter<boolean> = new EventEmitter<boolean>();

  settings: Object;
  source: LocalDataSource = new LocalDataSource();

  translate = [
    { en: "on", ch: "開啟" },
    { en: "off", ch: "關閉" },
    { en: "schedule", ch: "排程" },
  ];

  telemetrysId = ["b", "v", "c", "p"];

  constructor(
    private authService: AuthService,
    private alarmService: AlarmService,
    private dialogService: NbDialogService
  ) {
    this.createTableSettings();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["polesData"]) {
      this.source.load(this.translateControl("en", "ch"));
    }
  }

  ngOnInit(): void {
    this.source.load(this.translateControl("en", "ch"));
  }

  createTableSettings(): void {
    this.settings = {
      mode: "external",
      hideHeader: true,
      hideSubHeader: false,
      noDataMessage: $localize`:@@noData:無資料`,
      actions: {
        columnTitle: $localize`:@@action:操作`,
        add: false,
        edit: this.authService.isManager(),
        delete: false,
        position: "left",
      },
      edit: {
        editButtonContent: '<i class="nb-edit"></i>',
      },
      columns: {
        number: {
          title: $localize`:@@smartPoleNumber:智慧桿編號`,
          type: "string",
          filter: true,
          width: "25%",
        },
        b: {
          title: $localize`:@@brightnessWithUnit:亮度 (%)`,
          type: "number",
          filter: true,
          width: "25%",
        },
        v: {
          title: $localize`:@@voltWithUnit:電壓 (V)`,
          type: "number",
          filter: true,
          width: "25%",
        },
        c: {
          title: $localize`:@@currentWithUnit:電流 (mA)`,
          type: "number",
          filter: true,
          width: "25%",
        },
        p: {
          title: $localize`:@@powerWithUnit:功率 (W)`,
          type: "number",
          filter: true,
          width: "25%",
        },
        // light_control: {
        //   title: "控制模式",
        //   type: "string",
        //   filter: true,
        //   width: "25%",
        // },
      },
      pager: {
        display: true,
        perPage: 5,
        filter: false,
      },
    };
  }

  editPole(pole: PoleData): void {
    let poleData = this.polesData.find((data) => data.number === pole.number);
    this.dialogService
      .open(LightSettingsComponent, {
        context: {
          poleData: poleData,
        },
      })
      .onClose.subscribe((isUpdated) => {
        if (isUpdated) {
          this.onUpdated.emit(true);
        }
      });
  }

  translateControl(inputLang: string, outputLang: string): Array<PoleData> {
    let tempPolesData: Array<PoleData> = cloneDeep(this.polesData);
    tempPolesData.forEach((poleData) => {
      let controlLang = this.translate.find(
        (text) => text[inputLang] === poleData.light_control
      );
      if (controlLang) {
        poleData.light_control = controlLang[outputLang];
      }
    });
    return this.isLegalLightTime(tempPolesData);
  }

  isLegalLightTime(polesData: Array<PoleData>): Array<PoleData> {
    polesData.forEach((poleData) => {
      if (poleData.light_show !== "online") {
        this.telemetrysId.forEach((id) => {
          poleData[id] = SETTINGS.noData;
        });
      }
    });
    return polesData;
  }
}
